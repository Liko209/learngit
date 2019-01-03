import { IRTCCallObserver } from './IRTCCallObserver';
import { IRTCCallSession, CALL_SESSION_STATE } from './IRTCCallSession';
import { RTCSipCallSession } from './RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm, RTCCallFsmNotify } from './RTCCallFsm';
import { v4 as uuid } from 'uuid';
import { RTCCallInfo, RTCCALL_STATE, RTCCALL_ACTION } from './types';

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

  flip(target: number): void {
    this._fsm.flip(target);
  }

  startRecord(): void {
    this._fsm.startRecord();
  }

  stopRecord(): void {
    this._fsm.stopRecord();
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
    this._callSession.on(RTCCALL_ACTION.FLIP_SUCCESS, () => {
      this._onFlipSuccess();
    });
    this._callSession.on(RTCCALL_ACTION.FLIP_FAILED, () => {
      this._onFlipFailed();
    });
    this._callSession.on(RTCCALL_ACTION.START_RECORD_SUCCESS, () => {
      this._onStartRecordSuccess();
    });
    this._callSession.on(RTCCALL_ACTION.START_RECORD_FAILED, () => {
      this._onStartRecordFailed();
    });
    this._callSession.on(RTCCALL_ACTION.STOP_RECORD_SUCCESS, () => {
      this._onStopRecordSuccess();
    });
    this._callSession.on(RTCCALL_ACTION.STOP_RECORD_FAILED, () => {
      this._onStopRecordFailed();
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
    this._fsm.on(RTCCallFsmNotify.FLIP_ACTION, (target: number) => {
      this._onFlipAction(target);
    });
    this._fsm.on(RTCCallFsmNotify.START_RECORD_ACTION, () => {
      this._onStartRecordAction();
    });
    this._fsm.on(RTCCallFsmNotify.STOP_RECORD_ACTION, () => {
      this._onStopRecordAction();
    });
    this._fsm.on(RTCCallFsmNotify.FLIP_FAILED, () => {
      this._onFlipFailed();
    });
    this._fsm.on(RTCCallFsmNotify.START_RECORD_FAILED, () => {
      this._onStartRecordFailed();
    });
    this._fsm.on(RTCCallFsmNotify.STOP_RECORD_FAILED, () => {
      this._onStopRecordFailed();
    });
  }
  // call action listener
  private _onFlipSuccess() {
    this._observer.onCallAction(RTCCALL_ACTION.FLIP_SUCCESS);
  }

  private _onFlipFailed() {
    this._observer.onCallAction(RTCCALL_ACTION.FLIP_FAILED);
  }

  private _onStartRecordSuccess() {
    this._observer.onCallAction(RTCCALL_ACTION.START_RECORD_SUCCESS);
  }

  private _onStartRecordFailed() {
    this._observer.onCallAction(RTCCALL_ACTION.START_RECORD_FAILED);
  }

  private _onStopRecordSuccess() {
    this._observer.onCallAction(RTCCALL_ACTION.STOP_RECORD_SUCCESS);
  }

  private _onStopRecordFailed() {
    this._observer.onCallAction(RTCCALL_ACTION.STOP_RECORD_FAILED);
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

  private _onFlipAction(target: number) {
    this._callSession.flip(target);
  }

  private _onStartRecordAction() {
    this._callSession.startRecord();
  }

  private _onStopRecordAction() {
    this._callSession.stopRecord();
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
