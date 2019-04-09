/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 15:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { LifeCycle } from 'ts-javascript-state-machine';
import { observable, computed } from 'mobx';
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

const LOCAL_CALL_WINDOW_STATUS_KEY = 'localCallWindowStatusKey';

enum CALL_TYPE {
  NULL,
  INBOUND,
  OUTBOUND,
}

class TelephonyStore {
  private _callFSM = new CallFSM();
  private _callWindowFSM = new CallWindowFSM();
  private _holdFSM = new HoldFSM();
  private _recordFSM = new RecordFSM();
  private _recordDisableFSM = new RecordDisableFSM();

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
  phoneNumber?: string;
  @observable
  activeCallTime?: number;

  @observable
  pendingForHold: boolean = false;
  @observable
  pendingForRecord: boolean = false;

  constructor() {
    type FSM = '_callWindowFSM' | '_recordFSM' | '_recordDisableFSM';
    type FSMProps = 'callWindowState' | 'recordState' | 'recordDisabledState';

    [
      ['_callWindowFSM', 'callWindowState'],
      ['_recordFSM', 'recordState'],
      ['_recordDisableFSM', 'recordDisabledState'],
    ].forEach(([fsm, observableProp]: [FSM, FSMProps]) => {
      this[fsm].observe(
        'onAfterTransition',
        (lifecycle: LifeCycle) => {
          const { to } = lifecycle;
          this[observableProp] = to as CALL_WINDOW_STATUS | RECORD_STATE | RECORD_DISABLED_STATE;
        },
      );
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
      const { to } = lifecycle;
      this.callState = to as CALL_STATE;
      switch (this.callState) {
        case CALL_STATE.CONNECTED:
          this.activeCallTime = Date.now();
          this.enableHold();
          break;
        case CALL_STATE.IDLE:
          this.disableHold();
          this.disableRecord();
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
    }
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
    } = CALL_TRANSITION_NAMES;

    switch (true) {
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
  }

  directCall = () => {
    this._callFSM[CALL_TRANSITION_NAMES.START_DIRECT_CALL]();
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
      return;
    }
    this._holdFSM[HOLD_TRANSITION_NAMES.HOLD]();
  }

  unhold = () => {
    this._holdFSM[HOLD_TRANSITION_NAMES.UNHOLD]();
  }

  startRecording = () => {
    if (this.isRecording) {
      return;
    }
    this._recordFSM[RECORD_TRANSITION_NAMES.START_RECORD]();
  }

  stopRecording = () => {
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
    return this._recordDisableFSM[RECORD_DISABLED_STATE_TRANSITION_NAMES.ENABLE]();
  }

  disableHold = () => {
    this._holdFSM[HOLD_TRANSITION_NAMES.DISCONNECT]();
  }

  disableRecord = () => {
    return this._recordDisableFSM[RECORD_DISABLED_STATE_TRANSITION_NAMES.DISABLE]();
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
    return (this.recordState === RECORD_STATE.RECORDING);
  }

  @computed
  get recordDisabled() {
    return this.recordDisabledState === RECORD_DISABLED_STATE.DISABLED;
  }
}

export { TelephonyStore, CALL_TYPE };
