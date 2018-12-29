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
  private _isIncomingCall: boolean;

  static createOutgoingCall(
    toNum: string,
    account: IRTCAccount,
    observer: IRTCCallObserver,
  ): RTCCall {
    const call = new RTCCall(account, observer);
    call._callInfo.toNum = toNum;
    call._isIncomingCall = false;
    call._prepare();
    call._startOutCallFSM();
    return call;
  }

  static createIncomingCall(
    session: any,
    account: IRTCAccount,
    observer: IRTCCallObserver,
  ): RTCCall {
    const call = new RTCCall(account, observer);
    call.setCallSession(session);
    call._isIncomingCall = true;
    call._prepare();
    return call;
  }

  private constructor(account: IRTCAccount, observer: IRTCCallObserver) {
    this._account = account;
    this._observer = observer;
    this._callInfo.uuid = uuid();
    this._fsm = new RTCCallFsm();
    this._callSession = new RTCSipCallSession();
  }

  getCallState(): RTCCALL_STATE {
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
    this._fsm.on(RTCCallFsmNotify.ENTER_ANSWERING, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(RTCCallFsmNotify.ENTER_PENDING, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(RTCCallFsmNotify.ENTER_CONNECTING, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(RTCCallFsmNotify.ENTER_CONNECTED, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTED);
    });
    this._fsm.on(RTCCallFsmNotify.ENTER_DISCONNECTED, () => {
      this._onCallStateChange(RTCCALL_STATE.DISCONNECTED);
    });
    this._fsm.on(RTCCallFsmNotify.HANGUP_ACTION, () => {
      this._onHangupAction();
    });
    this._fsm.on(RTCCallFsmNotify.CREATE_OUTGOING_CALL_SESSION, () => {
      this._onCreateOutCallSession();
    });
    this._fsm.on(RTCCallFsmNotify.ANSWER_ACTION, () => {
      this._onAnswerAction();
    });
    this._fsm.on(RTCCallFsmNotify.REJECT_ACTION, () => {
      this._onRejectAction();
    });
    this._fsm.on(RTCCallFsmNotify.SEND_TO_VOICEMAIL_ACTION, () => {
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
