import {
  IRTCCallObserver,
  RTCCALL_STATE_IN_OBSERVER,
} from './IRTCCallObserver';
import { IRTCCallSession, CALL_SESSION_STATE } from './IRTCCallSession';
import { RTCSipCallSession } from './RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm, CALL_FSM_ACTION } from './RTCCallFsm';

type CallInfo = {
  fromName: string;
  fromNum: string;
  toName: string;
  toNum: string;
  uuid: string;
};

class RTCCall {
  private _callState: RTCCALL_STATE_IN_OBSERVER =
    RTCCALL_STATE_IN_OBSERVER.IDLE;
  private _callInfo: CallInfo = {
    fromName: '',
    fromNum: '',
    toName: '',
    toNum: '',
    uuid: '',
  };
  private _callSession: IRTCCallSession = new RTCSipCallSession();
  private _fsm: RTCCallFsm = new RTCCallFsm();
  private _account: IRTCAccount;
  private _observer: IRTCCallObserver;
  private _isIncomingCall: boolean = false;

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
  }

  getCallState(): RTCCALL_STATE_IN_OBSERVER {
    return this._callState;
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
    this._fsm.on('enterPending', () => {
      this._onCallStateChange(RTCCALL_STATE_IN_OBSERVER.CONNECTING);
    });
    this._fsm.on('enterConnecting', () => {
      this._onCallStateChange(RTCCALL_STATE_IN_OBSERVER.CONNECTING);
    });
    this._fsm.on('enterConnected', () => {
      this._onCallStateChange(RTCCALL_STATE_IN_OBSERVER.CONNECTED);
    });
    this._fsm.on('enterDisconnected', () => {
      this._onCallStateChange(RTCCALL_STATE_IN_OBSERVER.DISCONNECTED);
    });
    this._fsm.on(CALL_FSM_ACTION.HANGUP_ACTION, () => {
      this._onHangupAction();
    });
    this._fsm.on(CALL_FSM_ACTION.CREATE_OUTGOING_CALL_SESSION, () => {
      this._onCreateOutCallSession();
    });
    this._fsm.on(CALL_FSM_ACTION.ANSWER_ACTION, () => {
      this._onAnswerAction();
    });
    this._fsm.on(CALL_FSM_ACTION.REJECT_ACTION, () => {
      this._onRejectAction();
    });
    this._fsm.on(CALL_FSM_ACTION.SEND_TO_VOICEMAIL_ACTION, () => {
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

  private _onCallStateChange(state: RTCCALL_STATE_IN_OBSERVER): void {
    if (this._callState !== state) {
      this._callState = state;
      this._observer.onCallStateChange(state);
    }
  }
}

export { RTCCall, CallInfo };
