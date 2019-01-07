/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:14
 * Copyright © RingCentral. All rights reserved.
 */

import { IRTCCallObserver } from './IRTCCallObserver';
import { IRTCCallSession } from './IRTCCallSession';
import { RTCSipCallSession } from './RTCSipCallSession';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm } from './RTCCallFsm';
import { v4 as uuid } from 'uuid';

import {
  RTCCallInfo,
  RTCCALL_STATE,
  CALL_SESSION_STATE,
  CALL_FSM_NOTIFY,
  RTC_CALL_ACTION,
} from './types';

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
  private _isRecording: boolean = false;

  constructor(
    isIncoming: boolean,
    toNumber: string,
    session: any,
    account: IRTCAccount,
    observer: IRTCCallObserver,
  ) {
    this._account = account;
    this._observer = observer;
    this._isIncomingCall = isIncoming;
    this._callInfo.uuid = uuid();
    this._fsm = new RTCCallFsm();
    this._callSession = new RTCSipCallSession();
    if (this._isIncomingCall) {
      this.setCallSession(session);
    } else {
      this._callInfo.toNum = toNumber;
      this._startOutCallFSM();
    }
    this._prepare();
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

  flip(target: number): void {
    this._fsm.flip(target);
  }

  startRecord(): void {
    this._isRecording
      ? this._onCallActionSuccess(RTC_CALL_ACTION.START_RECORD)
      : this._fsm.startRecord();
  }

  stopRecord(): void {
    this._isRecording
      ? this._fsm.stopRecord()
      : this._onCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD);
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
      (callAction: RTC_CALL_ACTION) => {
        this._onCallActionSuccess(callAction);
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
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_PENDING, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_CONNECTING, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTING);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_CONNECTED, () => {
      this._onCallStateChange(RTCCALL_STATE.CONNECTED);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_DISCONNECTED, () => {
      this._onCallStateChange(RTCCALL_STATE.DISCONNECTED);
    });
    this._fsm.on(CALL_FSM_NOTIFY.HANGUP_ACTION, () => {
      this._onHangupAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.CREATE_OUTGOING_CALL_SESSION, () => {
      this._onCreateOutCallSession();
    });
    this._fsm.on(CALL_FSM_NOTIFY.FLIP_ACTION, (target: number) => {
      this._onFlipAction(target);
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
  }
  // call action listener
  private _onCallActionSuccess(callAction: RTC_CALL_ACTION) {
    switch (callAction) {
      case RTC_CALL_ACTION.START_RECORD: {
        this._isRecording = true;
        break;
      }
      case RTC_CALL_ACTION.STOP_RECORD: {
        this._isRecording = false;
        break;
      }
    }
    this._observer.onCallActionSuccess(callAction);
  }

  private _onCallActionFailed(callAction: RTC_CALL_ACTION) {
    this._observer.onCallActionFailed(callAction);
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
