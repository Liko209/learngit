/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:14
 * Copyright © RingCentral. All rights reserved.
 */
import { IRTCCallDelegate } from './IRTCCallDelegate';
import { IRTCCallSession } from '../signaling/IRTCCallSession';
import { RTCSipCallSession } from '../signaling/RTCSipCallSession';
import { RTCMediaStatsManager } from '../signaling/RTCMediaStatsManager';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCallFsm } from '../call/RTCCallFsm';
import {
  kRTCAnonymous,
  kRTCHangupInvalidCallInterval,
  kRTCGetStatsInterval,
} from '../account/constants';

import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../call/types';
import {
  RTCCallInfo,
  RTCCallOptions,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
} from './types';
import { v4 as uuid } from 'uuid';
import { RC_SIP_HEADER_NAME } from '../signaling/types';
import { rtcLogger } from '../utils/RTCLoggerProxy';

const LOG_TAG = 'RTCCall';

enum SDH_DIRECTION {
  SEND_ONLY = 'sendonly',
  SEND_RECV = 'sendrecv',
}

enum RECORD_STATE {
  IDLE = 'idle',
  RECORDING = 'recording',
  RECORD_IN_PROGRESS = 'recordInProgress',
}

class RTCCall {
  private _callState: RTC_CALL_STATE = RTC_CALL_STATE.IDLE;
  private _callInfo: RTCCallInfo = {
    fromName: '',
    fromNum: '',
    toName: '',
    toNum: '',
    uuid: '',
    partyId: '',
    sessionId: '',
  };
  private _callSession: IRTCCallSession;
  private _fsm: RTCCallFsm;
  private _account: IRTCAccount;
  private _delegate: IRTCCallDelegate;
  private _isIncomingCall: boolean;
  private _recordState: RECORD_STATE = RECORD_STATE.IDLE;
  private _isMute: boolean = false;
  private _options: RTCCallOptions = {};
  private _isAnonymous: boolean = false;
  private _hangupInvalidCallTimer: NodeJS.Timeout | null = null;
  private _rtcMediaStatsManager: RTCMediaStatsManager;
  private _isReinviteForHoldOrUnhold: boolean;

  constructor(
    isIncoming: boolean,
    toNumber: string,
    session: any,
    account: IRTCAccount,
    delegate: IRTCCallDelegate | null,
    options?: RTCCallOptions,
  ) {
    this._account = account;
    if (delegate != null) {
      this._delegate = delegate;
    }
    if (options) {
      this._options = options;
      if (this._options.fromNumber === kRTCAnonymous) {
        this._isAnonymous = true;
      }
    }
    this._isIncomingCall = isIncoming;
    this._callInfo.uuid = uuid();
    this._fsm = new RTCCallFsm();
    this._callSession = new RTCSipCallSession(this._callInfo.uuid);
    if (this._isIncomingCall) {
      this._callInfo.fromName = session.remoteIdentity.displayName;
      this._callInfo.fromNum = session.remoteIdentity.uri.aor.split('@')[0];
      this.setCallSession(session);
    } else {
      this._addHangupTimer();
      this._callInfo.toNum = toNumber;
    }
    this._rtcMediaStatsManager = new RTCMediaStatsManager();
    this._prepare();
  }

  isAnonymous() {
    return this._isAnonymous;
  }

  private _addHangupTimer(): void {
    this._hangupInvalidCallTimer = setTimeout(() => {
      rtcLogger.info(LOG_TAG, 'call time out and be hangup');
      this._delegate.onCallActionFailed(RTC_CALL_ACTION.CALL_TIME_OUT);
      this.hangup();
    },                                        kRTCHangupInvalidCallInterval * 1000);
  }

  setCallDelegate(delegate: IRTCCallDelegate) {
    this._delegate = delegate;
  }

  // This api is only for UT
  setCallState(newstate: RTC_CALL_STATE) {
    this._callState = newstate;
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

  getRecordState(): RECORD_STATE {
    return this._recordState;
  }

  isMuted(): boolean {
    return this._isMute;
  }

  answer(): void {
    this._fsm.answer();
  }

  reject(): void {
    this._fsm.reject();
  }

  ignore(): void {
    this._fsm.ignore();
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
    this._isReinviteForHoldOrUnhold = true;
    this._fsm.hold();
  }

  unhold(): void {
    this._isReinviteForHoldOrUnhold = true;
    this._fsm.unhold();
  }

  mute(): void {
    if (!this._isMute) {
      this._isMute = true;
      this._fsm.mute();
    }
    this._onCallActionSuccess(RTC_CALL_ACTION.MUTE, {});
  }

  unmute(): void {
    if (this._isMute) {
      this._isMute = false;
      this._fsm.unmute();
    }
    this._onCallActionSuccess(RTC_CALL_ACTION.UNMUTE, {});
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

  forward(target: string): void {
    if (target.length === 0 || !this._isIncomingCall) {
      this._delegate.onCallActionFailed(RTC_CALL_ACTION.FORWARD);
      return;
    }
    this._fsm.forward(target);
  }

  dtmf(digits: string): void {
    if (digits.length === 0) {
      return;
    }
    this._fsm.dtmf(digits);
  }

  onAccountReady() {
    this._fsm.accountReady();
  }

  onAccountNotReady() {
    this._fsm.accountNotReady();
  }

  setCallSession(session: any): void {
    this._callSession.setSession(session);
    if (
      this._isIncomingCall &&
      session &&
      session.request &&
      session.request.headers
    ) {
      // Update party id and session id in incoming call sip message
      this._parseRcApiIds(session.request.headers);
    }
  }

  private _prepare(): void {
    // listen session
    this._callSession.on(CALL_SESSION_STATE.ACCEPTED, () => {
      // Update party id and session id in invite response sip message
      const inviteRes = this._callSession.getInviteResponse();
      if (inviteRes && inviteRes.headers) {
        this._parseRcApiIds(inviteRes.headers);
      } else {
        rtcLogger.warn(
          LOG_TAG,
          "Can't get invite response for parsing partyid and sessionid",
        );
      }
      this._onSessionAccepted();
    });
    this._callSession.on(CALL_SESSION_STATE.CONFIRMED, () => {
      this._onSessionConfirmed();
    });
    this._callSession.on(CALL_SESSION_STATE.DISCONNECTED, () => {
      this._onSessionDisconnected();
    });
    this._callSession.on(CALL_SESSION_STATE.ERROR, () => {
      this._onSessionError();
    });
    this._callSession.on(CALL_SESSION_STATE.PROGRESS, (response: any) => {
      this._onSessionProgress(response);
    });
    this._callSession.on(
      CALL_SESSION_STATE.REINVITE_ACCEPTED,
      (session: any) => {
        this._onSessionReinviteAccepted(session);
      },
    );
    this._callSession.on(CALL_SESSION_STATE.REINVITE_FAILED, (session: any) => {
      this._onSessionReinviteFailed(session);
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
      this._clearHangupTimer();
      this._callSession.getMediaStats((report: any, session: any) => {
        this._rtcMediaStatsManager.setMediaStatsReport(report);
      },                              kRTCGetStatsInterval * 1000);
      this._isMute ? this._callSession.mute() : this._callSession.unmute();
      this._onCallStateChange(RTC_CALL_STATE.CONNECTED);
    });
    this._fsm.on(CALL_FSM_NOTIFY.ENTER_DISCONNECTED, () => {
      this._clearHangupTimer();
      this._onCallStateChange(RTC_CALL_STATE.DISCONNECTED);
      this._account.removeCallFromCallManager(this._callInfo.uuid);
      this._destroy();
    });
    this._fsm.on(CALL_FSM_NOTIFY.LEAVE_CONNECTED, () => {
      this._callSession.stopMediaStats();
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
    this._fsm.on(CALL_FSM_NOTIFY.FORWARD_ACTION, (target: string) => {
      this._onForwardAction(target);
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
    this._fsm.on(CALL_FSM_NOTIFY.MUTE_ACTION, () => {
      this._onMuteAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.UNMUTE_ACTION, () => {
      this._onUnmuteAction();
    });
    this._fsm.on(CALL_FSM_NOTIFY.DTMF_ACTION, (digits: string) => {
      this._onDtmfAction(digits);
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
        this._recordState = RECORD_STATE.RECORDING;
        break;
      }
      case RTC_CALL_ACTION.STOP_RECORD: {
        this._recordState = RECORD_STATE.IDLE;
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
      case RTC_CALL_ACTION.START_RECORD: {
        this._recordState = RECORD_STATE.IDLE;
        break;
      }
      case RTC_CALL_ACTION.STOP_RECORD: {
        this._recordState = RECORD_STATE.RECORDING;
        break;
      }
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

  private _clearHangupTimer() {
    if (this._hangupInvalidCallTimer) {
      clearTimeout(this._hangupInvalidCallTimer);
      this._hangupInvalidCallTimer = null;
    }
  }

  // session listener
  private _onSessionAccepted() {
    this._fsm.sessionAccepted();
  }
  private _onSessionConfirmed() {
    this._fsm.sessionConfirmed();
  }

  private _onSessionDisconnected() {
    this._fsm.sessionDisconnected();
  }

  private _onSessionError() {
    this._fsm.sessionError();
  }

  private _onSessionProgress(response: any) {
    if (response.status_code === 183) {
      this._clearHangupTimer();
    }
  }

  private _getSessionReinviteAction(session: any): RTC_CALL_ACTION {
    if (
      SDH_DIRECTION.SEND_ONLY ===
      session.sessionDescriptionHandler.getDirection()
    ) {
      return RTC_CALL_ACTION.HOLD;
    }
    return RTC_CALL_ACTION.UNHOLD;
  }

  private _onSessionReinviteAccepted(session: any) {
    if (this._isReinviteForHoldOrUnhold) {
      this._onCallActionSuccess(this._getSessionReinviteAction(session));
      this._isReinviteForHoldOrUnhold = false;
    }
  }

  private _onSessionReinviteFailed(session: any) {
    if (this._isReinviteForHoldOrUnhold) {
      this._onCallActionFailed(this._getSessionReinviteAction(session));
      this._isReinviteForHoldOrUnhold = false;
    }
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

  private _onForwardAction(target: string) {
    this._callSession.forward(target);
  }

  private _onParkAction() {
    this._callSession.park();
  }

  private _onStartRecordAction() {
    if (RECORD_STATE.RECORDING === this._recordState) {
      this._onCallActionSuccess(RTC_CALL_ACTION.START_RECORD);
    } else if (RECORD_STATE.IDLE === this._recordState) {
      this._recordState = RECORD_STATE.RECORD_IN_PROGRESS;
      this._callSession.startRecord();
    }
  }

  private _onStopRecordAction() {
    if (RECORD_STATE.RECORDING === this._recordState) {
      this._recordState = RECORD_STATE.RECORD_IN_PROGRESS;
      this._callSession.stopRecord();
    } else if (RECORD_STATE.IDLE === this._recordState) {
      this._onCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD);
    }
  }

  private _onMuteAction() {
    this._callSession.mute();
  }

  private _onUnmuteAction() {
    this._callSession.unmute();
  }

  private _onDtmfAction(digits: string) {
    this._callSession.dtmf(digits);
  }

  private _onCreateOutingCallSession() {
    const session = this._account.createOutgoingCallSession(
      this._callInfo.toNum,
      this._options,
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
  }

  // Header name: P-Rc-Api-Ids
  // Example: party-id=cs172622609264474468-2;session-id=Y3MxNzI2MjI2MDkyNjQ0NzQ0NjhAMTAuNzQuMy4xNw"
  private _parseRcApiIds(headers: any) {
    if (!headers) {
      return;
    }
    const apiIds = headers[RC_SIP_HEADER_NAME.RC_API_IDS];
    if (!apiIds) {
      rtcLogger.warn(
        LOG_TAG,
        `Sip headers have no ${RC_SIP_HEADER_NAME.RC_API_IDS}`,
      );
      return;
    }
    const idMap = apiIds[0]['raw'].split(';').map((sub: string) => {
      return sub.split('=');
    });
    this._callInfo.partyId = idMap[0][1];
    this._callInfo.sessionId = idMap[1][1];
    rtcLogger.info(
      LOG_TAG,
      `Got party id=${this._callInfo.partyId} session id=${
        this._callInfo.sessionId
      }`,
    );
  }
}

export { RTCCall };
