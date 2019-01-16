/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:14
 * Copyright © RingCentral. All rights reserved.
 */
import { IRTCCallDelegate } from './IRTCCallDelegate';
import { IRTCCallSession } from '../signaling/IRTCCallSession';
import { RTCSipCallSession } from '../signaling/RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm } from '../call/RTCCallFsm';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../call/types';
import {
  RTCCallInfo,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
} from './types';
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
  private _isRecording: boolean = false;

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

  flip(target: number): void {
    this._fsm.flip(target);
  }

  startRecord(): void {
    this._fsm.startRecord();
  }

  stopRecord(): void {
    this._fsm.stopRecord();
  }

  hold(): void {
    this._fsm.hold();
  }

  unhold(): void {
    this._fsm.unhold();
  }

  park(): void {
    this._fsm.park();
  }

  transfer(target: string): void {
    if (target.length === 0) {
      this._delegate.onCallActionFailed(RTC_CALL_ACTION.TRANSFER);
      return;
    }
    this._fsm.transfer(target);
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
    this._callSession.on(
      CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
      (
        callAction: RTC_CALL_ACTION,
        options: RTCCallActionSuccessOptions = {},
      ) => {
        this._onCallActionSuccess(callAction, options);
      },
    );
    this._callSession.on(
      CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
      (callAction: RTC_CALL_ACTION) => {
        this._onCallActionFailed(callAction);
      },
    );
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
      this._destroy();
    });
    this._fsm.on(CALL_FSM_NOTIFY.HANGUP_ACTION, () => {
      this._onHangupAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.CREATE_OUTGOING_CALL_SESSION, () => {
      this._onCreateOutingCallSession();
    });
    this._fsm.on(CALL_FSM_NOTIFY.FLIP_ACTION, (target: number) => {
      this._onFlipAction(target);
    });
    this._fsm.on(CALL_FSM_NOTIFY.TRANSFER_ACTION, (target: string) => {
      this._onTransferAction(target);
    });
    this._fsm.on(CALL_FSM_NOTIFY.PARK_ACTION, () => {
      this._onParkAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.START_RECORD_ACTION, () => {
      this._onStartRecordAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.STOP_RECORD_ACTION, () => {
      this._onStopRecordAction();
    });
    this._fsm.on(
      CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
      (callAction: RTC_CALL_ACTION) => {
        this._onCallActionFailed(callAction);
      },
    );
    this._fsm.on(CALL_FSM_NOTIFY.ANSWER_ACTION, () => {
      this._onAnswerAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.REJECT_ACTION, () => {
      this._onRejectAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.SEND_TO_VOICEMAIL_ACTION, () => {
      this._onSendToVoicemailAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.HOLD_ACTION, () => {
      this._onHoldAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.UNHOLD_ACTION, () => {
      this._onUnholdAction();
    });
  }

  private _destroy() {
    this._callSession.removeAllListeners();
    this._callSession.destroy();
  }
  // call action listener
  private _onCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions = {},
  ) {
    switch (callAction) {
      case RTC_CALL_ACTION.START_RECORD: {
        this._isRecording = true;
        break;
      }
      case RTC_CALL_ACTION.STOP_RECORD: {
        this._isRecording = false;
        break;
      }
      case RTC_CALL_ACTION.HOLD: {
        this._fsm.holdSuccess();
        break;
      }
      case RTC_CALL_ACTION.UNHOLD: {
        this._fsm.unholdSuccess();
        break;
      }
      default:
        break;
    }

    if (this._delegate) {
      this._delegate.onCallActionSuccess(callAction, options);
    }
  }

  private _onCallActionFailed(callAction: RTC_CALL_ACTION) {
    switch (callAction) {
      case RTC_CALL_ACTION.HOLD: {
        this._fsm.holdFailed();
        break;
      }
      case RTC_CALL_ACTION.UNHOLD: {
        this._fsm.unholdFailed();
        break;
      }
      default:
        break;
    }
    if (this._delegate) {
      this._delegate.onCallActionFailed(callAction);
    }
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

  private _onHoldAction() {
    this._callSession.hold();
  }

  private _onUnholdAction() {
    this._callSession.unhold();
  }

  private _onHangupAction() {
    this._callSession.hangup();
  }

  private _onFlipAction(target: number) {
    this._callSession.flip(target);
  }

  private _onTransferAction(target: string) {
    this._callSession.transfer(target);
  }

  private _onParkAction() {
    this._callSession.park();
  }

  private _onStartRecordAction() {
    this._isRecording
      ? this._onCallActionSuccess(RTC_CALL_ACTION.START_RECORD)
      : this._callSession.startRecord();
  }

  private _onStopRecordAction() {
    this._isRecording
      ? this._callSession.stopRecord()
      : this._onCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD);
  }

  private _onCreateOutingCallSession() {
    const session = this._account.createOutgoingCallSession(
      this._callInfo.toNum,
    );
    this.setCallSession(session);
  }

  private _onCallStateChange(state: RTC_CALL_STATE): void {
    if (this._callState === state) {
      return;
    }
    this._callState = state;
    if (this._delegate) {
      this._delegate.onCallStateChange(state);
    }
    if (this._callState === RTC_CALL_STATE.DISCONNECTED) {
      this._account.removeCallFromCallManager(this._callInfo.uuid);
    }
  }
}

export { RTCCall };
