/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:14
 * Copyright © RingCentral. All rights reserved.
 */

import { IRTCCallObserver } from './IRTCCallObserver';
import { IRTCCallSession, CALL_SESSION_STATE } from './IRTCCallSession';
import { RTCSipCallSession } from './RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm, RTCCallFsmNotify } from './RTCCallFsm';
import { v4 as uuid } from 'uuid';
import { RTCCallInfo, RTCCALL_STATE } from './types';

class RTCCall {
  private _callState: RTCCALL_STATE = RTCCALL_STATE.IDLE;
  private _callInfo: RTCCallInfo = {
    fromName: '',
    fromNum: '',
    toName: '',
    toNum: '',
    uuid: '',
  };
  private _callSession: IRTCCallSession;
  private _fsm: RTCCallFsm;
  private _account: IRTCAccount;
  private _observer: IRTCCallObserver;
  private _isIncomingCall: boolean = false;

  constructor(toNum: string, account: IRTCAccount, observer: IRTCCallObserver) {
    this._callSession = new RTCSipCallSession();
    this._fsm = new RTCCallFsm();
    this._callInfo.toNum = toNum;
    this._callInfo.uuid = uuid();
    this._account = account;
    this._observer = observer;
    this._prepare();
    this._startOutCallFSM();
  }

  getCallState(): RTCCALL_STATE {
    return this._callState;
  }

  hangup(): void {
    this._fsm.hangup();
  }

  onAccountReady(): void {
    this._fsm.accountReady();
  }

  setCallSession(session: any): void {
    this._callSession.setSession(session);
  }

  private _startOutCallFSM(): void {
    if (this._account.isReady()) {
      this._fsm.accountReady();
    } else {
      this._fsm.accountNotReady();
    }
  }

  private _prepare(): void {
    // listen session
    this._callSession.on(CALL_SESSION_STATE.CONFIRMED, () => {
      this._onSessionConfirmed();
    });
    this._callSession.on(CALL_SESSION_STATE.DISCONNECTED, () => {
      this._onSessionDisconnected();
    });
    this._callSession.on(CALL_SESSION_STATE.ERROR, () => {
      this._onSessionError();
    });
    // listen fsm
    this._fsm.on(RTCCallFsmNotify.ENTERPENDING, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(RTCCallFsmNotify.ENTERCONNECTING, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(RTCCallFsmNotify.ENTERCONNECTED, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTED);
    });
    this._fsm.on(RTCCallFsmNotify.ENTERDISCONNECTED, () => {
      this._onCallStateChange(RTCCALL_STATE.DISCONNECTED);
    });
    this._fsm.on(RTCCallFsmNotify.HANGUPACTION, () => {
      this._onHangupAction();
    });
    this._fsm.on(RTCCallFsmNotify.CREATEOUTCALLSESSION, () => {
      this._onCreateOutCallSession();
    });
  }

  // session listener
  private _onSessionConfirmed() {
    this._fsm.sessionConfirmed();
  }

  private _onSessionDisconnected() {
    this._fsm.sessionDisconnected();
  }

  private _onSessionError() {
    this._fsm.sessionError();
  }
  // fsm listener
  private _onHangupAction() {
    this._callSession.hangup();
  }

  private _onCreateOutCallSession() {
    this._account.createOutCallSession(this._callInfo.toNum);
  }

  private _onCallStateChange(state: RTCCALL_STATE): void {
    if (this._callState !== state) {
      this._callState = state;
      this._observer.onCallStateChange(state);
    }
  }
}

export { RTCCall };
