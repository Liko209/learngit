import {
  IRTCCallObserver,
  RTCCALL_STATE_IN_OBSERVER,
} from './IRTCCallObserver';
import { IRTCCallSession, CALL_SESSION_STATE } from './IRTCCallSession';
import { RTCSipCallSession } from './RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm } from './RTCCallFsm';

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

  constructor(toNum: string, account: IRTCAccount, observer: IRTCCallObserver) {
    this._callInfo.toNum = toNum;
    this._account = account;
    this._observer = observer;
    this._prepare();
    this._startOutCallFSM();
  }

  getCallState(): RTCCALL_STATE_IN_OBSERVER {
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
    this._fsm.on('hangupAction', () => {
      this._onHangupAction();
    });
    this._fsm.on('createOutCallSession', () => {
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

  private _onCallStateChange(state: RTCCALL_STATE_IN_OBSERVER): void {
    if (this._callState !== state) {
      this._callState = state;
      this._observer.onCallStateChange(state);
    }
  }
}

export { RTCCall, CallInfo };
