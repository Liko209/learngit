/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 15:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { LifeCycle } from 'ts-javascript-state-machine';
import { observable, computed, action, reaction } from 'mobx';
import { PersonService } from 'sdk/module/person';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { i18nP } from '@/utils/i18nT';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import { Person, PhoneNumberModel } from 'sdk/module/person/entity';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';
import { v4 } from 'uuid';
import {
  CALL_WINDOW_STATUS,
  CallWindowFSM,
  CALL_WINDOW_TRANSITION_NAMES,
} from '../FSM';
import {
  ANONYMOUS_NAME,
  ANONYMOUS_NUM,
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
import { formatSeconds } from './utils';
import { VoicemailNotification, MissedCallNotification } from './types';

type SelectedCallItem = { phoneNumber: string; index: number };
const LOCAL_CALL_WINDOW_STATUS_KEY = 'localCallWindowStatusKey';

class TelephonyStore {
  private _callWindowFSM = new CallWindowFSM();
  private _intervalReplyId?: NodeJS.Timeout;
  private _history: Set<CALL_DIRECTION | typeof DIALING> = new Set();
  private _phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
    ServiceConfig.PHONE_NUMBER_SERVICE,
  );

  maximumInputLength = 30;

  @observable
  isConference: boolean = false;

  @observable
  canUseTelephony: boolean = false;

  @observable
  callWindowState: CALL_WINDOW_STATUS = this._callWindowFSM.state;

  isStopRecording: boolean = false; // whether the stop recording request is on the flight

  @observable
  uid?: number;

  @observable
  isContactMatched: boolean = false;

  @observable
  id: number | undefined = undefined;

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

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  transferString: string = '';

  @observable
  private _dialerString: string = '';

  @observable
  isValidInputStringNumber: boolean = false;

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

  @observable
  private _isRecentCallsInDialerPage: boolean = false;

  @observable
  isTransferPage: boolean = false;

  @observable
  selectedCallItem: SelectedCallItem = {
    phoneNumber: '',
    index: NaN,
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  firstLetterEnteredThroughKeypadForInputString: boolean;
  @observable
  firstLetterEnteredThroughKeypadForForwardString: boolean;

  @observable
  enteredDialer: boolean = false;

  @observable
  isExt: boolean = false;

  // only exist one e911 dialog
  @observable
  hasShowE911: boolean = false;

  @observable
  voicemailNotification: VoicemailNotification;

  @observable
  missedCallNotification: MissedCallNotification;

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
      async (length: number) => {
        if (!length) {
          this.resetFirstLetterThroughKeypadForInputString();
          this.transferString = this.inputString;
        }
        this.resetCallItem();
        this.isValidInputStringNumber = await this._phoneNumberService.isValidNumber(this.inputString);
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
    return this.callerName === ANONYMOUS_NAME || !this.callerName
      ? ''
      : this.callerName;
  }

  private _formatPhoneNumber = async (phoneNumber: string) => {
    const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
      ServiceConfig.PHONE_NUMBER_SERVICE,
    );

    return await phoneNumberService.getLocalCanonical(phoneNumber);
  };

  private _matchPersonByPhoneNumber = async (phoneNumber: string) => {
    const matchedContact = await this._matchContactByPhoneNumber(phoneNumber);

    return (
      matchedContact &&
      getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, matchedContact.id)
    );
  };

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
  private _clearTransferString = () => {
    this.transferString = '';
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
        break;
    }

    this.resetReply();
    this.backIncoming();
    this.quitKeypad();
    this._clearEnteredKeys();
    this._clearForwardString();
    this._clearTransferString();
    if (this.isTransferPage) {
      this.backToDialerFromTransferPage();
    }

    this.isContactMatched = false;
    this.hasManualSelected = false;
    this.isConference = false;
    this._history.delete(CALL_DIRECTION.INBOUND);

    // for TelephonyNotificationManger can get call disconnected state.
    Promise.resolve().then(() => {
      this.id = undefined;
    });
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

  @action
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

  @action
  resetValidInputStringNumber = () => {
    this.isValidInputStringNumber = false;
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
    return [undefined, CALL_STATE.DISCONNECTED].includes(this.callState);
  }

  @computed
  get isIncomingCall() {
    return this.callState === CALL_STATE.IDLE && this.isInbound;
  }

  @computed
  get call(): CallModel {
    const id = this.id || NaN;
    return getEntity<Call, CallModel>(ENTITY_NAME.CALL, id);
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
  get activeCallDirection() {
    return this.call && this.call.direction;
  }

  @computed
  get callDisconnected(): boolean {
    return this.callState === CALL_STATE.DISCONNECTED;
  }

  @computed
  get uuid() {
    return this.call.uuid;
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
    return (
      !(
        this.hasActiveOutBoundCall ||
        this.hasActiveInBoundCall ||
        this.isIncomingCall
      ) || this.isTransferPage
    );
  }

  @computed
  get callerName() {
    return this.isInbound ? this.call.fromName : this.call.toName;
  }

  @computed
  get phoneNumber() {
    const phoneNumber = this.isInbound ? this.call.fromNum : this.call.toNum;
    return phoneNumber !== ANONYMOUS_NUM ? phoneNumber : '';
  }

  @action
  jumpToRecentCall = () => {
    this.isRecentCalls = true;
  };

  @action
  backToDialer = () => {
    this.isRecentCalls = false;
    this.resetCallItem();
  };

  @action
  switchE911Status = (status: boolean) => {
    this.hasShowE911 = status;
  };

  @action
  directToTransferPage = () => {
    this.isTransferPage = true;
    this._isRecentCallsInDialerPage = this.isRecentCalls;
    this.backToDialer();
    if (this.inputString.length) {
      this._dialerString = this.inputString;
      this.inputString = '';
    }
  };

  @action
  backToDialerFromTransferPage = () => {
    this.isTransferPage = false;
    this.isRecentCalls = this._isRecentCallsInDialerPage;
    this.resetValidInputStringNumber();
    if (this._dialerString.length) {
      this.inputString = this._dialerString;
      this._dialerString = '';
      return;
    }
    return this.inputString = '';
  };

  @action
  setCallItem = (phoneNumber: string, index: number) => {
    this.selectedCallItem = {
      phoneNumber,
      index,
    };
  };

  @action
  resetCallItem = () => {
    this.selectedCallItem = {
      phoneNumber: '',
      index: NaN,
    };
  }

  updateVoicemailNotification = async (voicemail: Voicemail) => {
    const { id, from, attachments } = voicemail;
    const { displayName, displayNumber } = await this._getNotificationCallerInfo(from);

    this.voicemailNotification = {
      id,
      title: `${displayName} ${displayNumber}`,
      body: this._getVoicemailNotificationBody(attachments),
    };
  };

  @action
  updateMissedCallNotification = async (callLog: CallLog) => {
    const { id, from } = callLog;
    const { displayName, displayNumber } = await this._getNotificationCallerInfo(from);

    this.missedCallNotification = {
      id,
      displayNumber,
      title: i18nP('telephony.result.missedcall'),
      body: `${displayName} ${displayNumber}`
    };
  };

  private _getNotificationCallerInfo = async (caller: Voicemail['from']) => {
    const { extensionNumber = '', phoneNumber = '' } = caller || {};
    const contactNumber = extensionNumber || phoneNumber;

    if (!contactNumber) {
      return { displayName: i18nP('telephony.unknownCaller'), displayNumber: '' };
    }

    const displayNumber = this._formatPhoneNumber(contactNumber);

    const matchPerson = await this._matchPersonByPhoneNumber(contactNumber);

    const displayName = matchPerson ? matchPerson.userDisplayName : caller.name;

    return { displayName, displayNumber: await displayNumber };
  };

  private _getVoicemailNotificationBody = (
    attachments: Voicemail['attachments'],
  ) => {
    const audio = attachments && attachments[0];
    const text = i18nP('telephony.notification.newVoicemail');

    return audio ? `${text} ${formatSeconds(audio.vmDuration)}` : text;
  };
}

export { TelephonyStore, CALL_TYPE, INCOMING_STATE, SelectedCallItem };
