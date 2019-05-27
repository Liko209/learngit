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
  HOLD_STATE,
  HOLD_TRANSITION_NAMES,
  CALL_STATE,
  CALL_WINDOW_STATUS,
  RecordFSM,
  RECORD_TRANSITION_NAMES,
  RECORD_STATE,
  RecordDisableFSM,
  RECORD_DISABLED_STATE,
  RECORD_DISABLED_STATE_TRANSITION_NAMES,
  CallFSM,
  HoldFSM,
  CallWindowFSM,
  CALL_TRANSITION_NAMES,
  CALL_WINDOW_TRANSITION_NAMES,
} from '../FSM';
import { ANONYMOUS } from '../interface/constant';
const some = require('lodash/some');
const LOCAL_CALL_WINDOW_STATUS_KEY = 'localCallWindowStatusKey';

enum CALL_TYPE {
  NULL,
  INBOUND,
  OUTBOUND,
}

enum INCOMING_STATE {
  IDLE,
  REPLY,
}

const logTag = '[TelephonyStore_View]';
const INITIAL_REPLY_COUNTDOWN_TIME = 55;

class TelephonyStore {
  private _callFSM = new CallFSM();
  private _callWindowFSM = new CallWindowFSM();
  private _holdFSM = new HoldFSM();
  private _recordFSM = new RecordFSM();
  private _recordDisableFSM = new RecordDisableFSM();
  private _intervalReplyId?: NodeJS.Timeout;

  maximumInputLength = 30;

  @observable
  canUseTelephony: boolean = false;

  @observable
  callWindowState: CALL_WINDOW_STATUS = this._callWindowFSM.state;
  @observable
  callState: CALL_STATE = this._callFSM.state;
  @observable
  callType: CALL_TYPE = CALL_TYPE.NULL;
  @observable
  holdState: HOLD_STATE = this._holdFSM.state;

  @observable
  recordState: RECORD_STATE = this._recordFSM.state;
  @observable
  recordDisabledState: RECORD_DISABLED_STATE = this._recordDisableFSM.state;

  @observable
  uid?: number;
  @observable
  phoneNumber?: string;
  @observable
  isContactMatched: boolean = false;
  @observable
  callId: string;
  @observable
  callerName?: string;
  @observable
  activeCallTime?: number;
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
  isMute = false;

  @observable
  pendingForHold: boolean = false;
  @observable
  pendingForRecord: boolean = false;

  @observable
  shouldResume: boolean;

  @observable
  inputString: string = '';

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

  constructor() {
    type FSM = '_callWindowFSM' | '_recordFSM' | '_recordDisableFSM';
    type FSMProps = 'callWindowState' | 'recordState' | 'recordDisabledState';

    [
      ['_callWindowFSM', 'callWindowState'],
      ['_recordFSM', 'recordState'],
      ['_recordDisableFSM', 'recordDisabledState'],
    ].forEach(([fsm, observableProp]: [FSM, FSMProps]) => {
      this[fsm].observe('onAfterTransition', (lifecycle: LifeCycle) => {
        const { to } = lifecycle;
        this[observableProp] = to as
          | CALL_WINDOW_STATUS
          | RECORD_STATE
          | RECORD_DISABLED_STATE;
      });
    });

    this._holdFSM.observe('onAfterTransition', (lifecycle: LifeCycle) => {
      const { to } = lifecycle;
      this.holdState = to as HOLD_STATE;
      switch (this.holdState) {
        case HOLD_STATE.HOLDED:
          this.disableRecord();
          break;
        case HOLD_STATE.IDLE:
          this.enableRecord();
          break;
      }
    });

    this._callFSM.observe('onAfterTransition', (lifecycle: LifeCycle) => {
      const { to, from } = lifecycle;
      if (to === from) {
        return;
      }
      this.callState = to as CALL_STATE;
      switch (this.callState) {
        case CALL_STATE.CONNECTED:
          this.activeCallTime = Date.now();
          this.enableHold();
          break;
        case CALL_STATE.DIALING:
        case CALL_STATE.IDLE:
          this.resetReply();
          this.quitKeypad();
          this._restoreButtonStates();
          this._clearEnteredKeys();
          this.callerName = undefined;
          this.isMute = false;
          this.phoneNumber = undefined;
          break;
        case CALL_STATE.CONNECTING:
          this.activeCallTime = undefined;
          break;
        default:
          setTimeout(() => {
            this.activeCallTime = undefined;
          },         300);
          break;
      }
    });

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
  }

  @computed
  get person() {
    if (!this.uid) return null;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.uid);
  }

  @computed
  get displayName() {
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

  private _restoreButtonStates() {
    this.disableHold();
    this.disableRecord();
    this.stopRecording();
  }

  private _clearEnteredKeys = () => {
    this.enteredKeys = '';
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

  openKeypad = () => {
    this.keypadEntered = true;
  }

  quitKeypad = () => {
    this.keypadEntered = false;
  }

  inputKey = (key: string) => {
    this.enteredKeys += key;
  }

  inputCustomReplyMessage = (msg: string) => {
    this.customReplyMessage = msg.trimLeft();
  }

  setShiftKeyDown = (down: boolean) => {
    this.shiftKeyDown = down;
  }

  openDialer = () => {
    this._callFSM[CALL_TRANSITION_NAMES.OPEN_DIALER]();
    this._openCallWindow();
  }

  closeDialer = () => {
    this._closeCallWindow();
    this._callFSM[CALL_TRANSITION_NAMES.CLOSE_DIALER]();
  }

  attachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.FLOATING;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.ATTACHED_WINDOW]();
  }

  detachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.DETACHED;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.DETACHED_WINDOW]();
  }

  end = () => {
    const history: CALL_STATE[] = this._callFSM.history;
    const {
      END_INCOMING_CALL,
      END_DIRECT_CALL,
      END_WIDGET_CALL,
      END_DIALER_CALL,
      END_INCOMING_CALL_AND_RESUME,
    } = CALL_TRANSITION_NAMES;

    switch (true) {
      case history.includes(CALL_STATE.INCOMING) &&
        history.includes(CALL_STATE.DIALING) &&
        this.shouldResume:
        this.openDialer();
        this._callFSM[END_INCOMING_CALL_AND_RESUME]();
        break;
      case history.includes(CALL_STATE.INCOMING):
        this._closeCallWindow();
        this._callFSM[END_INCOMING_CALL]();
        break;
      case !history.includes(CALL_STATE.DIALING):
        this._closeCallWindow();
        this._callFSM[END_DIRECT_CALL]();
        break;
      case this._localCallWindowStatus === CALL_WINDOW_STATUS.MINIMIZED:
        this._callFSM[END_WIDGET_CALL]();
        break;
      default:
        this._callFSM[END_DIALER_CALL]();
        break;
    }
  }

  dialerCall = () => {
    this._callFSM[CALL_TRANSITION_NAMES.START_DIALER_CALL]();
    this.shouldResume = false;
  }

  directCall = () => {
    this._callFSM[CALL_TRANSITION_NAMES.START_DIRECT_CALL]();
    this.shouldResume = false;
    this._openCallWindow();
  }

  incomingCall = () => {
    this._callFSM[CALL_TRANSITION_NAMES.START_INCOMING_CALL]();
    this._openCallWindow();
  }

  answer = () => {
    this._callFSM[CALL_TRANSITION_NAMES.ANSWER_INCOMING_CALL]();
  }

  connected = () => {
    this._callFSM[CALL_TRANSITION_NAMES.HAS_CONNECTED]();
  }

  hold = () => {
    if (this.held) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to hold from held`,
      );
      return;
    }
    this._holdFSM[HOLD_TRANSITION_NAMES.HOLD]();
  }

  unhold = () => {
    if (!this.held) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to unhold from idle`,
      );
      return;
    }
    this._holdFSM[HOLD_TRANSITION_NAMES.UNHOLD]();
  }

  startRecording = () => {
    if (this.isRecording) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to record from recording`,
      );
      return;
    }
    this._recordFSM[RECORD_TRANSITION_NAMES.START_RECORD]();
  }

  stopRecording = () => {
    if (!this.isRecording) {
      mainLogger.debug(
        `${logTag} Invalid transition: unable to stop recording from idle`,
      );
      return;
    }
    this._recordFSM[RECORD_TRANSITION_NAMES.STOP_RECORD]();
  }

  setPendingForHoldBtn(val: boolean) {
    this.pendingForHold = val;
  }

  setPendingForRecordBtn(val: boolean) {
    this.pendingForRecord = val;
  }

  enableHold = () => {
    this._holdFSM[HOLD_TRANSITION_NAMES.CONNECTED]();
  }

  enableRecord = () => {
    // prettier-ignore
    return this._recordDisableFSM[RECORD_DISABLED_STATE_TRANSITION_NAMES.ENABLE]();
  }

  disableHold = () => {
    this._holdFSM[HOLD_TRANSITION_NAMES.DISCONNECT]();
  }

  disableRecord = () => {
    // prettier-ignore
    return this._recordDisableFSM[RECORD_DISABLED_STATE_TRANSITION_NAMES.DISABLE]();
  }

  onDialerInputFocus = () => {
    this.dialerInputFocused = true;
  }

  onDialerInputBlur = () => {
    this.dialerInputFocused = false;
  }

  onDialerFocus = () => {
    this.dialerFocused = true;
  }

  onDialerBlur = () => {
    this.dialerFocused = false;
  }

  startAnimation = () => {
    this.startMinimizeAnimation = true;
  }

  stopAnimation = () => {
    this.startMinimizeAnimation = false;
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
    return this.holdState === HOLD_STATE.DISABLED;
  }

  @computed
  get held() {
    return this.holdState === HOLD_STATE.HOLDED;
  }

  @computed
  get isRecording() {
    return this.recordState === RECORD_STATE.RECORDING;
  }

  @computed
  get recordDisabled() {
    return this.recordDisabledState === RECORD_DISABLED_STATE.DISABLED;
  }

  directReply = () => {
    this.incomingState = INCOMING_STATE.REPLY;
    if (!this._intervalReplyId) {
      this._createReplyInterval();
    }
  }

  quitReply = () => {
    this.incomingState = INCOMING_STATE.IDLE;
  }

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

  @action
  switchBetweenMuteAndUnmute = () => {
    this.isMute = !this.isMute;
  }

  @computed
  get shouldDisplayDialer() {
    // TODO: change this when refactoring for multi-call
    return [CALL_STATE.DIALING, CALL_STATE.IDLE].includes(this.callState);
  }

  @computed
  get hasIncomingCall() {
    return this.callState === CALL_STATE.INCOMING;
  }
}

export { TelephonyStore, CALL_TYPE, INCOMING_STATE };
