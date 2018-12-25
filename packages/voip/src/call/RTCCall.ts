import {
  IRTCCallObserver,
  RTCCALL_STATE_IN_OBSERVER,
} from './IRTCCallObserver';
import { IRTCCallSession } from './IrtcCallSession';
import { RTCSipCallSession, SIP_CALL_SESSION_STATE } from './RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm } from './rtcCallFsm';

type CallInfo = {
  fromName: String;
  fromNum: String;
  toName: String;
  toNume: String;
  uuid: String;
};

class RTCCall {
  private _callState: RTCCALL_STATE_IN_OBSERVER =
    RTCCALL_STATE_IN_OBSERVER.IDLE;
  private _callInfo: CallInfo;
  private _callSession: IRTCCallSession = new RTCSipCallSession();
  private _fsm: RTCCallFsm;
  private _account: IRTCAccount;
  private _observer: IRTCCallObserver;
  private _isIncomingCall: boolean = false;

  constructor(toNum: String, account: IRTCAccount, observer: IRTCCallObserver) {
    this._callInfo.toNume = toNum;
    this._account = account;
    this._observer = observer;
    this._prepare();
    this._startOutCallFSM();
  }

  getCallState(): RTCCALL_STATE_IN_OBSERVER {
    return this._callState;
  }

  hangup(): void {}

  private _startOutCallFSM(): void {}
  private _prepare(): void {
    // listen session
    this._callSession.on(SIP_CALL_SESSION_STATE.CONFIRMED, () => {
      this._onSessionConfirmed();
    });
    this._callSession.on(SIP_CALL_SESSION_STATE.DISCONNECTED, () => {
      this._onSessionDisconnected();
    });
    this._callSession.on(SIP_CALL_SESSION_STATE.ERROR, () => {
      this._onSessionError();
    });
    // listen fsm
    this._fsm.on(SIP_CALL_SESSION_STATE.ERROR, () => {
      this._onCallStateChange();
    });
  }

  // session listener
  private _onSessionConfirmed() {}

  private _onSessionDisconnected() {}

  private _onSessionError() {}
  // fsm listener
  private _onHangupAction() {}
  private _onCreateOutCallSession() {}
  private _onCallStateChange(state: RTCCALL_STATE_IN_OBSERVER): void {
    if (this._callState !== state) {
      this._callState = state;
      this._observer.onCallStateChange(state);
    }
  }
}
