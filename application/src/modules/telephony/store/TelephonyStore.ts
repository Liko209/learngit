/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 15:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { LifeCycle } from 'ts-javascript-state-machine';
import { observable, computed } from 'mobx';
import {
  CALL_STATE,
  CALL_WINDOW_STATUS,
  CallFSM,
  CallWindowFSM,
  CALL_TRANSITION_NAMES,
  CALL_WINDOW_TRANSITION_NAMES,
} from '../FSM';

const LOCAL_CALL_WINDOW_STATUS_KEY = 'localCallWindowStatusKey';

class TelephonyStore {
  @observable
  callWindowState: CALL_WINDOW_STATUS = CALL_WINDOW_STATUS.MINIMIZED;
  @observable
  callState: CALL_STATE = CALL_STATE.IDLE;

  private _callFSM = new CallFSM();
  private _callWindowFSM = new CallWindowFSM();

  constructor() {
    this._callFSM.observe('onAfterTransition', (lifecycle: LifeCycle) => {
      const { to } = lifecycle;
      this.callState = to as CALL_STATE;
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
    this._openCallWindow();
    this._callFSM[CALL_TRANSITION_NAMES.START_DIRECT_CALL]();
  }

  incomingCall = () => {
    this._openCallWindow();
    this._callFSM[CALL_TRANSITION_NAMES.START_INCOMING_CALL]();
  }

  answer = () => {
    this._callFSM[CALL_TRANSITION_NAMES.ANSWER_INCOMING_CALL]();
  }

  connected = () => {
    this._callFSM[CALL_TRANSITION_NAMES.HAS_CONNECTED]();
  }

  @computed
  get isDetached() {
    if (this.callWindowState === CALL_WINDOW_STATUS.FLOATING) {
      return false;
    }
    return true;
  }
}

export { TelephonyStore };
