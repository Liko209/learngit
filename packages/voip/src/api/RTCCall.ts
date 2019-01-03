/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:27
 * Copyright © RingCentral. All rights reserved.
 */
import { IRTCCallDelegate } from './IRTCCallDelegate';
import { IRTCCallSession } from '../signaling/IRTCCallSession';
import { RTCSipCallSession } from '../signaling/RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm } from '../call/RTCCallFsm';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../call/types';
import { RTCCallInfo, RTC_CALL_STATE } from './types';
import { v4 as uuid } from 'uuid';

class RTCCall {
  private _callState: RTC_CALL_STATE = RTC_CALL_STATE.IDLE;
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
  private _delegate: IRTCCallDelegate;
  private _isIncomingCall: boolean;

  constructor(
    isIncoming: boolean,
    toNumber: string,
    session: any,
    account: IRTCAccount,
    delegate: IRTCCallDelegate | null,
  ) {
    this._account = account;
    if (delegate != null) {
      this._delegate = delegate;
    }
    this._isIncomingCall = isIncoming;
    this._callInfo.uuid = uuid();
    this._fsm = new RTCCallFsm();
    this._callSession = new RTCSipCallSession();
    if (this._isIncomingCall) {
      this._callInfo.fromName = session.remoteIdentity.displayName;
      this._callInfo.fromNum = session.remoteIdentity.uri.aor.split('@')[0];
      this.setCallSession(session);
    } else {
      this._callInfo.toNum = toNumber;
      this._startOutCallFSM();
    }
    this._prepare();
  }

  setCallDelegate(delegate: IRTCCallDelegate) {
    this._delegate = delegate;
  }

  getCallState(): RTC_CALL_STATE {
    return this._callState;
  }

  isIncomingCall(): boolean {
    return this._isIncomingCall;
  }

  getCallInfo(): RTCCallInfo {
    return this._callInfo;
  }

  answer(): void {
    this._fsm.answer();
  }

  reject(): void {
    this._fsm.reject();
  }

  sendToVoicemail(): void {
    this._fsm.sendToVoicemail();
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
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_ANSWERING, () => {
      this._onCallStateChange(RTC_CALL_STATE.CONNECTING);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_PENDING, () => {
      this._onCallStateChange(RTC_CALL_STATE.CONNECTING);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_CONNECTING, () => {
      this._onCallStateChange(RTC_CALL_STATE.CONNECTING);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_CONNECTED, () => {
      this._onCallStateChange(RTC_CALL_STATE.CONNECTED);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_DISCONNECTED, () => {
      this._onCallStateChange(RTC_CALL_STATE.DISCONNECTED);
    });
    this._fsm.on(CALL_FSM_NOTIFY.HANGUP_ACTION, () => {
      this._onHangupAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.CREATE_OUTGOING_CALL_SESSION, () => {
      this._onCreateOutCallSession();
    });
    this._fsm.on(CALL_FSM_NOTIFY.ANSWER_ACTION, () => {
      this._onAnswerAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.REJECT_ACTION, () => {
      this._onRejectAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.SEND_TO_VOICEMAIL_ACTION, () => {
      this._onSendToVoicemailAction();
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
  private _onAnswerAction() {
    this._callSession.answer();
  }

  private _onRejectAction() {
    this._callSession.reject();
  }

  private _onSendToVoicemailAction() {
    this._callSession.sendToVoicemail();
  }

  private _onHangupAction() {
    this._callSession.hangup();
  }

  private _onCreateOutCallSession() {
    const session = this._account.createOutCallSession(this._callInfo.toNum);
    this.setCallSession(session);
  }

  private _onCallStateChange(state: RTC_CALL_STATE): void {
    if (this._callState !== state) {
      this._callState = state;
      this._delegate.onCallStateChange(state);
    }
  }
}

export { RTCCall };
