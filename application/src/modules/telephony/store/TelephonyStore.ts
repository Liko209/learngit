/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 15:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { LifeCycle } from 'ts-javascript-state-machine';
import {
  observable, computed, action, reaction
} from 'mobx';
import { PersonService } from 'sdk/module/person';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import { Person, PhoneNumberModel } from 'sdk/module/person/entity';
import { v4 } from 'uuid';
import {
  CALL_WINDOW_STATUS,
  CallWindowFSM,
  CALL_WINDOW_TRANSITION_NAMES,
} from '../FSM';
import {
  ANONYMOUS,
  INCOMING_STATE,
  DIALING,
  INITIAL_REPLY_COUNTDOWN_TIME,
  CALL_TYPE,
} from '../interface/constant';
import {
  Call,
  HOLD_STATE,
  RECORD_STATE,
  MUTE_STATE,
  CALL_STATE,
  CALL_DIRECTION,
} from 'sdk/module/telephony/entity';
import CallModel from '@/store/models/Call';

const LOCAL_CALL_WINDOW_STATUS_KEY = 'localCallWindowStatusKey';

class TelephonyStore {
  private _callWindowFSM = new CallWindowFSM();
  private _intervalReplyId?: NodeJS.Timeout;
  private _history: Set<CALL_DIRECTION | typeof DIALING> = new Set();

  maximumInputLength = 30;

  @observable
  canUseTelephony: boolean = false;

  @observable
  callWindowState: CALL_WINDOW_STATUS = this._callWindowFSM.state;

  isStopRecording: boolean = false; // whether the stop recording request is on the flight

  @observable
  uid?: number;

  @observable
  phoneNumber?: string; // original phone number without parsed

  @observable
  isContactMatched: boolean = false;

  @observable
  id: number = 0;

  @observable
  callerName?: string;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  replyCountdownTime?: number = INITIAL_REPLY_COUNTDOWN_TIME;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  keypadEntered: boolean = false;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  enteredKeys: string = '';

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  customReplyMessage: string = '';

  @observable
  shouldKeepDialog: boolean;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  inputString: string = '';

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  forwardString: string = '';

  @observable
  dialerInputFocused: boolean = false;

  @observable
  hasManualSelected: boolean = false;

  @observable
  chosenCallerPhoneNumber: string;

  @observable
  defaultCallerPhoneNumber: string;

  @observable
  callerPhoneNumberList: PhoneNumberModel[] = [];

  @observable
  dialerOpenedCount: number;

  @observable
  startMinimizeAnimation: boolean = false;

  @observable
  dialerMinimizeTranslateX: number = NaN;

  @observable
  dialerMinimizeTranslateY: number = NaN;

  @observable
  dialerHeight: number = NaN;

  @observable
  dialerWidth: number = NaN;

  dialpadBtnId = v4();
  dialerId = v4();

  @observable
  incomingState: INCOMING_STATE = INCOMING_STATE.IDLE;

  @observable
  dialerFocused: boolean;

  @observable
  isRecentCalls: boolean = false;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  firstLetterEnteredThroughKeypadForInputString: boolean;
  @observable
  firstLetterEnteredThroughKeypadForForwardString: boolean;

  @observable
  enteredDialer: boolean = false;

  @observable
  isExt: boolean = false;

  constructor() {
    type FSM = '_callWindowFSM';
    type FSMProps = 'callWindowState';

    [['_callWindowFSM', 'callWindowState']].forEach(
      ([fsm, observableProp]: [FSM, FSMProps]) => {
        this[fsm].observe('onAfterTransition', (lifecycle: LifeCycle) => {
          const { to } = lifecycle;
          this[observableProp] = to as CALL_WINDOW_STATUS;
        });
      },
    );

    reaction(
      () => this.phoneNumber,
      async (phoneNumber: string) => {
        if (phoneNumber) {
          const contact = await this._matchContactByPhoneNumber(phoneNumber);
          this.uid = contact ? contact.id : undefined;
        } else {
          this.uid = undefined;
        }
        this.isContactMatched = true;
      },
      { fireImmediately: true },
    );

    // TODO: move out of telephony store when minization won't destroy the telephony dialog
    reaction(
      () => this.inputString.length,
      length => {
        if (!length) {
          this.resetFirstLetterThroughKeypadForInputString();
        }
      },
    );

    // TODO: move out of telephony store when minization won't destroy the telephony dialog
    reaction(
      () => this.forwardString.length,
      length => {
        if (!length) {
          this.resetFirstLetterThroughKeypadForForwardString();
        }
      },
    );

    reaction(
      () => this.call && this.callState,
      callState => {
        if (callState === CALL_STATE.DISCONNECTED) {
          this.end();
        }
      },
    );
  }

  @computed
  get person() {
    if (!this.uid) return null;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.uid);
  }

  @computed
  get displayName() {
    if (!this.isContactMatched) {
      return undefined;
    }
    if (this.person) {
      return this.person.userDisplayName;
    }
    return this.callerName === ANONYMOUS || !this.callerName
      ? ''
      : this.callerName;
  }

  private _matchContactByPhoneNumber = async (phone: string) => {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );

    return await personService.matchContactByPhoneNumber(phone);
  };

  private get _localCallWindowStatus() {
    const localCallWindowStatus = localStorage.getItem(
      LOCAL_CALL_WINDOW_STATUS_KEY,
    );
    return localCallWindowStatus
      ? (localCallWindowStatus as CALL_WINDOW_STATUS)
      : CALL_WINDOW_STATUS.FLOATING;
  }

  private set _localCallWindowStatus(status: CALL_WINDOW_STATUS) {
    localStorage.setItem(LOCAL_CALL_WINDOW_STATUS_KEY, status);
  }

  @action
  private _closeCallWindow = () => {
    if (this.callWindowState !== CALL_WINDOW_STATUS.MINIMIZED) {
      this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.CLOSE_DIALER]();
    }
  };

  @action
  private _openCallWindow = () => {
    const {
      OPEN_DETACHED_DIALER,
      OPEN_FLOATING_DIALER,
    } = CALL_WINDOW_TRANSITION_NAMES;
    if (this.callWindowState === CALL_WINDOW_STATUS.MINIMIZED) {
      if (this._localCallWindowStatus === CALL_WINDOW_STATUS.DETACHED) {
        this._callWindowFSM[OPEN_DETACHED_DIALER]();
        return;
      }
      this._callWindowFSM[OPEN_FLOATING_DIALER]();
      this.stopAnimation();
    }
  };

  @action
  private _clearEnteredKeys = () => {
    this.enteredKeys = '';
  };

  @action
  private _clearForwardString = () => {
    this.forwardString = '';
  };

  @action
  openKeypad = () => {
    this.keypadEntered = true;
  };

  @action
  quitKeypad = () => {
    this.keypadEntered = false;
  };

  @action
  inputKey = (key: string) => {
    this.enteredKeys += key;
  };

  inputCustomReplyMessage = (msg: string) => {
    this.customReplyMessage = msg.trimLeft();
  };

  @action
  openDialer = () => {
    this._history.add(DIALING);
    this._openCallWindow();
    this.shouldKeepDialog = true;
  };

  @action
  closeDialer = () => {
    this._closeCallWindow();
    this.shouldKeepDialog = false;
    this._history.delete(DIALING);
  };

  @action
  attachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.FLOATING;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.ATTACHED_WINDOW]();
  };

  @action
  detachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.DETACHED;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.DETACHED_WINDOW]();
  };

  @action
  end = () => {
    const history = this._history;

    switch (true) {
      case history.has(CALL_DIRECTION.INBOUND) &&
        history.has(DIALING) &&
        this.shouldKeepDialog:
        this.openDialer();
        break;

      case history.has(CALL_DIRECTION.INBOUND) || !history.has(DIALING):
        this._closeCallWindow();
        this._history.delete(DIALING);
        break;
      default:
        // this._history.delete(DIALING);
        break;
    }

    this.resetReply();
    this.backIncoming();
    this.quitKeypad();
    this._clearEnteredKeys();
    this._clearForwardString();
    this.callerName = undefined;
    this.phoneNumber = undefined;
    this.isContactMatched = false;
    this.hasManualSelected = false;
    this._history.delete(CALL_DIRECTION.INBOUND);
  };

  @action
  directCall = () => {
    this.resetFirstLetterThroughKeypadForInputString();
    this._openCallWindow();
  };

  @action
  incomingCall = () => {
    this._history.add(CALL_DIRECTION.INBOUND);
    this._openCallWindow();
  };

  onDialerInputFocus = () => {
    this.dialerInputFocused = true;
  };

  @action
  onDialerInputBlur = () => {
    this.dialerInputFocused = false;
  };

  @action
  onDialerFocus = () => {
    this.dialerFocused = true;
  };

  @action
  onDialerBlur = () => {
    this.dialerFocused = false;
  };

  @action
  startAnimation = () => {
    this.startMinimizeAnimation = true;
  };

  @action
  stopAnimation = () => {
    this.startMinimizeAnimation = false;
  };

  @action
  enterFirstLetterThroughKeypadForInputString = () => {
    this.firstLetterEnteredThroughKeypadForInputString = true;
  };

  @action
  resetFirstLetterThroughKeypadForInputString = () => {
    this.firstLetterEnteredThroughKeypadForInputString = false;
  };

  @action
  enterFirstLetterThroughKeypadForForwardString = () => {
    this.firstLetterEnteredThroughKeypadForForwardString = true;
  };

  @action
  resetFirstLetterThroughKeypadForForwardString = () => {
    this.firstLetterEnteredThroughKeypadForForwardString = false;
  };

  @computed
  get isDetached() {
    if (this.callWindowState === CALL_WINDOW_STATUS.DETACHED) {
      return true;
    }
    return false;
  }

  // TODO: move to Hold.ViewModel.ts when implementing the multi-call feature
  @computed
  get holdDisabled() {
    return this.holdState === HOLD_STATE.DISABLED;
  }

  // TODO: move to Hold.ViewModel.ts when implementing the multi-call feature
  @computed
  get held() {
    return this.holdState === HOLD_STATE.HELD;
  }

  // TODO: move to Record.ViewModel.ts when implementing the multi-call feature
  @computed
  get isRecording() {
    return [RECORD_STATE.RECORDING, RECORD_STATE.RECORDING_DISABLED].includes(
      this.recordState,
    );
  }

  // TODO: move to Record.ViewModel.ts when implementing the multi-call feature
  @computed
  get recordDisabled() {
    return [RECORD_STATE.DISABLED, RECORD_STATE.RECORDING_DISABLED].includes(
      this.recordState,
    );
  }

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  directReply = () => {
    this.incomingState = INCOMING_STATE.REPLY;
    if (!this._intervalReplyId) {
      this._createReplyInterval();
    }
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  directForward = () => {
    this.incomingState = INCOMING_STATE.FORWARD;
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  backIncoming = () => {
    this.incomingState = INCOMING_STATE.IDLE;
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  resetReply = () => {
    this.replyCountdownTime = undefined;
    this.customReplyMessage = '';
    this._intervalReplyId && clearInterval(this._intervalReplyId);
    this._intervalReplyId = undefined;
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action.bound
  private _createReplyInterval() {
    this.replyCountdownTime = INITIAL_REPLY_COUNTDOWN_TIME;
    this._intervalReplyId = setInterval(() => {
      this.replyCountdownTime && --this.replyCountdownTime;
      if (!this.replyCountdownTime) {
        this._intervalReplyId && clearInterval(this._intervalReplyId);
      }
    }, 1000);
  }

  @computed
  get shouldDisplayDialer() {
    // TODO: change this when refactoring for multi-call
    return (
      [undefined, CALL_STATE.DISCONNECTED].includes(this.callState) ||
      this.incomingState === INCOMING_STATE.FORWARD
    );
  }

  @computed
  get isIncomingCall() {
    return this.callState === CALL_STATE.IDLE && this.isInbound;
  }

  @computed
  get call(): CallModel {
    return getEntity<Call, CallModel>(ENTITY_NAME.CALL, this.id);
  }

  @computed
  get holdState(): HOLD_STATE {
    return this.call.holdState;
  }

  @computed
  get recordState(): RECORD_STATE {
    return this.call.recordState;
  }

  @computed
  get callState(): CALL_STATE {
    return this.call.callState;
  }

  @computed
  get isMute(): boolean {
    return this.call.muteState === MUTE_STATE.MUTED;
  }

  @computed
  get activeCallTime(): number {
    return this.call.connectTime;
  }

  @computed
  get callConnectingTime(): number {
    return this.call.connectingTime;
  }

  @computed
  get isInbound(): boolean {
    return this.call.direction === CALL_DIRECTION.INBOUND;
  }

  @computed
  get isOutbound(): boolean {
    return this.call.direction === CALL_DIRECTION.OUTBOUND;
  }

  @computed
  get callDisconnected(): boolean {
    return this.callState === CALL_STATE.DISCONNECTED;
  }

  @computed
  get callId() {
    if (this.callDisconnected) {
      return undefined;
    }
    return this.call.callId;
  }

  // TODO: should change the prop's name since it's isomorphic to `CALL_DIRECTION`
  @computed
  get callType() {
    switch (true) {
      case this.isInbound:
        return CALL_TYPE.INBOUND;
      case this.isOutbound:
        return CALL_TYPE.OUTBOUND;
      default:
        return CALL_TYPE.NULL;
    }
  }

  @action
  syncDialerEntered(entered: boolean) {
    this.enteredDialer = entered;
  }

  @computed
  get hasActiveCall() {
    return [CALL_STATE.CONNECTED, CALL_STATE.CONNECTING].includes(
      this.callState,
    );
  }

  @computed
  get hasActiveOutBoundCall() {
    return this.hasActiveCall && this.isOutbound;
  }

  @computed
  get hasActiveInBoundCall() {
    return this.hasActiveCall && this.isInbound;
  }

  @computed
  get shouldDisplayRecentCalls() {
    return !(
      this.hasActiveOutBoundCall ||
      this.hasActiveInBoundCall ||
      this.isIncomingCall
    );
  }

  @action
  jumpToRecentCall = () => {
    this.isRecentCalls = true;
  };

  @action
  backToDialer = () => {
    this.isRecentCalls = false;
  };
}

export { TelephonyStore, CALL_TYPE, INCOMING_STATE };
