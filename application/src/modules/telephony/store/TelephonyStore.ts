/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 15:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { LifeCycle } from 'ts-javascript-state-machine';
import { observable, computed, action, reaction } from 'mobx';
import { PersonService, ContactType } from 'sdk/module/person';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { mainLogger } from 'sdk';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import {
  Person,
  PHONE_NUMBER_TYPE,
  PhoneNumberModel,
} from 'sdk/module/person/entity';
import { v4 } from 'uuid';
import {
  CALL_WINDOW_STATUS,
  CallWindowFSM,
  CALL_WINDOW_TRANSITION_NAMES,
} from '../FSM';
import { ANONYMOUS } from '../interface/constant';
const some = require('lodash/some');
const LOCAL_CALL_WINDOW_STATUS_KEY = 'localCallWindowStatusKey';

import {
  Call,
  HOLD_STATE,
  RECORD_STATE,
  MUTE_STATE,
  CALL_STATE,
  CALL_DIRECTION,
} from 'sdk/module/telephony/entity';
import CallModel from '@/store/models/Call';

enum CALL_TYPE {
  NULL,
  INBOUND,
  OUTBOUND,
}

const DIALING = 'dialing';

enum INCOMING_STATE {
  IDLE,
  REPLY,
  FORWARD,
}

const logTag = '[TelephonyStore_View]';
const INITIAL_REPLY_COUNTDOWN_TIME = 55;

class TelephonyStore {
  private _callWindowFSM = new CallWindowFSM();
  private _intervalReplyId?: NodeJS.Timeout;
  private _history: Set<CALL_DIRECTION | typeof DIALING> = new Set();

  maximumInputLength = 30;

  @observable
  canUseTelephony: boolean = false;

  @observable
  callWindowState: CALL_WINDOW_STATUS = this._callWindowFSM.state;
  @observable
  isStopRecording: boolean = false;

  @observable
  uid?: number;
  @observable
  phoneNumber?: string;
  @observable
  isContactMatched: boolean = false;

  @observable
  id: number = 0;

  @observable
  callerName?: string;

  @observable
  replyCountdownTime?: number = INITIAL_REPLY_COUNTDOWN_TIME;
  @observable
  keypadEntered: boolean = false;
  @observable
  enteredKeys: string = '';
  @observable
  customReplyMessage: string = '';
  @observable
  shiftKeyDown = false;

  @observable
  pendingForHold: boolean = false;
  @observable
  pendingForRecord: boolean = false;

  @observable
  shouldKeepDialog: boolean;

  @observable
  inputString: string = '';

  @observable
  forwardString: string = '';

  @observable
  dialerInputFocused: boolean = false;

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
  firstLetterEnteredThroughKeypad: boolean;

  @observable
  enteredDialer: boolean = false;

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

    reaction(
      () => this.inputString.length,
      length => {
        if (!length) {
          this.firstLetterEnteredThroughKeypad = false;
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

  @computed
  get isExt() {
    if (this.person) {
      return some(this.person.phoneNumbers, {
        type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
        phoneNumber: this.phoneNumber,
      });
    }
    return false;
  }

  @computed
  get shouldEnterContactSearch() {
    return (
      this.shouldDisplayDialer &&
      !!this.inputString.trim().length &&
      !this.firstLetterEnteredThroughKeypad
    );
  }

  private _matchContactByPhoneNumber = async (phone: string) => {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );

    return await personService.matchContactByPhoneNumber(
      phone,
      ContactType.GLIP_CONTACT,
    );
  }

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

  private _closeCallWindow = () => {
    if (this.callWindowState !== CALL_WINDOW_STATUS.MINIMIZED) {
      this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.CLOSE_DIALER]();
    }
  }

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
  }

  @action
  private _restoreButtonStates() {
    this.stopRecording();
  }

  private _clearEnteredKeys = () => {
    this.enteredKeys = '';
  }

  private _clearForwardString = () => {
    this.forwardString = '';
  }

  updateDefaultChosenNumber = (defaultCallerPhoneNumber?: string) => {
    if (defaultCallerPhoneNumber !== undefined) {
      this.defaultCallerPhoneNumber = defaultCallerPhoneNumber;
    } else if (
      Array.isArray(this.callerPhoneNumberList) &&
      this.callerPhoneNumberList.length
    ) {
      this.defaultCallerPhoneNumber = this.callerPhoneNumberList[0].phoneNumber;
    }
  }

  @action
  openKeypad = () => {
    this.keypadEntered = true;
  }

  @action
  quitKeypad = () => {
    this.keypadEntered = false;
  }

  @action
  inputKey = (key: string) => {
    this.enteredKeys += key;
  }

  inputCustomReplyMessage = (msg: string) => {
    this.customReplyMessage = msg.trimLeft();
  }

  @action
  setShiftKeyDown = (down: boolean) => {
    this.shiftKeyDown = down;
  }

  @action
  openDialer = () => {
    this._history.add(DIALING);
    this._openCallWindow();
    this.shouldKeepDialog = true;
  }

  @action
  closeDialer = () => {
    this._closeCallWindow();
    this.shouldKeepDialog = false;
    this._history.delete(DIALING);
  }

  @action
  attachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.FLOATING;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.ATTACHED_WINDOW]();
  }

  @action
  detachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.DETACHED;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.DETACHED_WINDOW]();
  }

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
    this.quitKeypad();
    this._restoreButtonStates();
    this._clearEnteredKeys();
    this._clearForwardString();
    this.callerName = undefined;
    this.phoneNumber = undefined;
    this.isContactMatched = false;
    this._history.delete(CALL_DIRECTION.INBOUND);
  }

  @action
  dialerCall = () => {}

  @action
  directCall = () => {
    this.firstLetterEnteredThroughKeypad = false;
    this._openCallWindow();
  }

  @action
  incomingCall = () => {
    this._history.add(CALL_DIRECTION.INBOUND);
    this._openCallWindow();
  }

  hold = () => {
    if (this.held) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to hold from held`,
      );
    }
  }

  @action
  unhold = () => {
    if (!this.held) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to unhold from idle`,
      );
    }
  }

  @action
  startRecording = () => {
    if (this.isRecording) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to record from recording`,
      );
    }
  }

  @action
  stopRecording = () => {
    if (!this.isRecording) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to stop recording from idle`,
      );
    }
  }

  @action
  setPendingForHoldBtn(val: boolean) {
    this.pendingForHold = val;
  }

  @action
  setPendingForRecordBtn(val: boolean) {
    this.pendingForRecord = val;
  }

  onDialerInputFocus = () => {
    this.dialerInputFocused = true;
  }

  @action
  onDialerInputBlur = () => {
    this.dialerInputFocused = false;
  }

  @action
  onDialerFocus = () => {
    this.dialerFocused = true;
  }

  @action
  onDialerBlur = () => {
    this.dialerFocused = false;
  }

  @action
  startAnimation = () => {
    this.startMinimizeAnimation = true;
  }

  @action
  stopAnimation = () => {
    this.startMinimizeAnimation = false;
  }

  @action
  enterFirstLetterThroughKeypad = () => {
    this.firstLetterEnteredThroughKeypad = true;
  }

  @computed
  get isDetached() {
    if (this.callWindowState === CALL_WINDOW_STATUS.FLOATING) {
      return false;
    }
    return true;
  }

  @computed
  get holdDisabled() {
    return this.holdState === HOLD_STATE.DISABLE;
  }

  @computed
  get held() {
    return this.holdState === HOLD_STATE.HELD;
  }

  @computed
  get isRecording() {
    return this.recordState === RECORD_STATE.RECORDING;
  }

  @computed
  get recordDisabled() {
    return this.recordState === RECORD_STATE.DISABLE;
  }

  @action
  directReply = () => {
    this.incomingState = INCOMING_STATE.REPLY;
    if (!this._intervalReplyId) {
      this._createReplyInterval();
    }
  }

  @action
  directForward = () => {
    this.incomingState = INCOMING_STATE.FORWARD;
  }

  @action
  backIncoming = () => {
    this.incomingState = INCOMING_STATE.IDLE;
  }

  @action
  resetReply = () => {
    this.replyCountdownTime = undefined;
    this.customReplyMessage = '';
    this._intervalReplyId && clearInterval(this._intervalReplyId);
    this._intervalReplyId = undefined;
  }

  @action.bound
  private _createReplyInterval() {
    this.replyCountdownTime = INITIAL_REPLY_COUNTDOWN_TIME;
    this._intervalReplyId = setInterval(() => {
      this.replyCountdownTime && --this.replyCountdownTime;
      if (!this.replyCountdownTime) {
        this._intervalReplyId && clearInterval(this._intervalReplyId);
      }
    },                                  1000);
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
    return this.callState === CALL_STATE.IDLE && this.inbound;
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
  get inbound(): boolean {
    return this.call.direction === CALL_DIRECTION.INBOUND;
  }

  @computed
  get outbound(): boolean {
    return this.call.direction === CALL_DIRECTION.OUTBOUND;
  }

  @computed
  get callDisconnected(): boolean {
    return this.callState === CALL_STATE.DISCONNECTED;
  }

  @computed
  get callId(): string {
    return this.call.callId;
  }

  @computed
  get callType() {
    switch (true) {
      case this.inbound:
        return CALL_TYPE.INBOUND;
      case this.outbound:
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
    return this.hasActiveCall && this.outbound;
  }

  @computed
  get hasActiveInBoundCall() {
    return this.hasActiveCall && this.inbound;
  }
}

export { TelephonyStore, CALL_TYPE, INCOMING_STATE };
