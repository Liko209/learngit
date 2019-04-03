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

  @observable
  callWindowState: CALL_WINDOW_STATUS = this._callWindowFSM.state;
  @observable
  callState: CALL_STATE = this._callFSM.state;
  @observable
  callType: CALL_TYPE = CALL_TYPE.NULL;
  @observable
  holdState: HOLD_STATE = this._holdFSM.state;
  @observable
  phoneNumber?: string;
  @observable
  activeCallTime?: number;
  @observable
  pendingForHold: boolean = false;

  constructor() {
    this._holdFSM.observe('onAfterTransition', (lifecycle: LifeCycle) => {
      const { to } = lifecycle;
      this.holdState = to as HOLD_STATE;
    });
    this._callFSM.observe('onAfterTransition', (lifecycle: LifeCycle) => {
      const { to } = lifecycle;
      this.callState = to as CALL_STATE;
      switch (this.callState) {
        case CALL_STATE.CONNECTED:
          this.activeCallTime = Date.now();
          this._holdFSM[HOLD_TRANSITION_NAMES.CONNECTED]();
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
    this._callWindowFSM.observe('onAfterTransition', (lifecycle: LifeCycle) => {
      const { to } = lifecycle;
      this.callWindowState = to as CALL_WINDOW_STATUS;
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
    this._holdFSM[HOLD_TRANSITION_NAMES.DISCONNECT]();

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
    this._holdFSM[HOLD_TRANSITION_NAMES.HOLD]();
  }

  unhold = () => {
    this._holdFSM[HOLD_TRANSITION_NAMES.UNHOLD]();
  }

  setPendingForHoldBtn(val: boolean) {
    this.pendingForHold = val;
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
}

export { TelephonyStore, CALL_TYPE };
