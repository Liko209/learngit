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
import {
  kRTCAnonymous,
  kRTCHangupInvalidCallInterval,
} from '../account/constants';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../call/types';
import {
  RTCCallInfo,
  RTCCallOptions,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTCUserInfo,
  RECORD_STATE,
  RTC_CALL_ACTION_ERROR_CODE,
  RTC_NO_AUDIO_TYPE,
  RTCNoAudioStateEvent,
  RTCNoAudioDataEvent,
  RTC_CALL_ACTION_DIRECTION,
} from './types';
import { v4 as uuid } from 'uuid';
import { RC_SIP_HEADER_NAME } from '../signaling/types';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { CallReport } from '../report/Call';
import {
  CALL_REPORT_PROPS,
  Establishment,
  CallEventCategory,
} from '../report/types';

const LOG_TAG = 'RTCCall';

enum SDH_DIRECTION {
  SEND_ONLY = 'sendonly',
  SEND_RECV = 'sendrecv',
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
  private _isLocalMute: boolean = false;
  private _isRemoteMute: boolean = false;
  private _options: RTCCallOptions = {};
  private _isAnonymous: boolean = false;
  private _hangupInvalidCallTimer: NodeJS.Timeout | null = null;
  private _connectedTimestamp: Date | undefined = undefined;
  private _userAgent: string = '';
  private _report: CallReport;

  constructor(
    isIncoming: boolean,
    toNumber: string,
    session: any,
    account: IRTCAccount,
    delegate: IRTCCallDelegate | null,
    options?: RTCCallOptions,
    userInfo?: RTCUserInfo,
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
    let direction: string;
    let establishmentKey: keyof Establishment;

    this._isIncomingCall = isIncoming;
    this._callInfo.uuid = uuid();
    this._report = new CallReport();
    this._fsm = new RTCCallFsm(this._report);
    this._callSession = new RTCSipCallSession(
      this._callInfo.uuid,
      this._report,
    );

    if (this._isIncomingCall) {
      this._callInfo.fromName = session.remoteIdentity.displayName;
      this._callInfo.fromNum = session.remoteIdentity.uri.aor.split('@')[0];
      this.setCallSession(session);
      direction = 'incoming';
      establishmentKey = 'answerTime';
    } else {
      this._addHangupTimer();
      this._callInfo.toNum = toNumber;
      direction = 'outgoing';
      establishmentKey = 'startTime';
    }

    if (userInfo && userInfo.userAgent) {
      this._userAgent = userInfo.userAgent;
    }

    this._report.updateByPipe([
      { key: CALL_REPORT_PROPS.ID, value: this._callInfo.uuid },
      { key: CALL_REPORT_PROPS.DIRECTION, value: direction },
      { key: CALL_REPORT_PROPS.CREATE_TIME, value: new Date() },
      { key: CALL_REPORT_PROPS.UA, value: userInfo },
    ]);
    this._report.updateEstablishment(establishmentKey);
    this._prepare();
  }

  isAnonymous() {
    return this._isAnonymous;
  }

  private _addHangupTimer(): void {
    this._hangupInvalidCallTimer = setTimeout(() => {
      rtcLogger.info(LOG_TAG, 'call time out and be hangup');
      this._onCallActionFailed(RTC_CALL_ACTION.CALL_TIME_OUT, RTC_CALL_ACTION_ERROR_CODE.INVALID);
      this.hangup();
    }, kRTCHangupInvalidCallInterval * 1000);
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
    return this._isLocalMute;
  }

  isRemoteMuted(): boolean {
    return this._isRemoteMute;
  }

  answer(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'answer');
    this._reportCallActionEvent(RTC_CALL_ACTION.ANSWER);
    this._fsm.answer();
  }

  reject(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'reject');
    this._reportCallActionEvent(RTC_CALL_ACTION.REJECT);
    this._fsm.reject();
  }

  ignore(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'ignore');
    this._reportCallActionEvent(RTC_CALL_ACTION.IGNORE);
    this._fsm.ignore();
  }

  sendToVoicemail(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'sendToVoicemail');
    this._reportCallActionEvent(RTC_CALL_ACTION.SEND_TO_VM);
    this._fsm.sendToVoicemail();
  }

  startReply(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'startReply');
    this._reportCallActionEvent(RTC_CALL_ACTION.START_REPLY);
    if (!this.isIncomingCall()) {
      this._onCallActionFailed(
        RTC_CALL_ACTION.START_REPLY,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      return;
    }
    this._fsm.startReplyWithMessage();
  }

  replyWithMessage(message: string): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'replyWithMessage');
    this._reportCallActionEvent(RTC_CALL_ACTION.REPLY_WITH_MSG);
    if (!message || message.length === 0) {
      this._onCallActionFailed(
        RTC_CALL_ACTION.REPLY_WITH_MSG,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      return;
    }
    if (!this.isIncomingCall()) {
      this._onCallActionFailed(
        RTC_CALL_ACTION.REPLY_WITH_MSG,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      return;
    }
    this._fsm.replyWithMessage(message);
  }

  replyWithPattern(
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number = 0,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT = RTC_REPLY_MSG_TIME_UNIT.MINUTE,
  ): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'replyWithPattern');
    this._reportCallActionEvent(RTC_CALL_ACTION.REPLY_WITH_PATTERN);
    if (!this.isIncomingCall()) {
      this._onCallActionFailed(
        RTC_CALL_ACTION.REPLY_WITH_PATTERN,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      return;
    }
    this._fsm.replyWithPattern(pattern, time, timeUnit);
  }

  hangup(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, RTC_CALL_ACTION.HANGUP);
    this._reportCallActionEvent(RTC_CALL_ACTION.HANGUP);
    this._fsm.hangup();
    this._account.removeCallFromCallManager(this._callInfo.uuid);
  }

  flip(target: number): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'flip');
    this._reportCallActionEvent(RTC_CALL_ACTION.FLIP);
    this._fsm.flip(target);
  }

  startRecord(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'startRecord');
    this._reportCallActionEvent(RTC_CALL_ACTION.START_RECORD);
    this._fsm.startRecord();
  }

  stopRecord(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'stopRecord');
    this._reportCallActionEvent(RTC_CALL_ACTION.STOP_RECORD);
    this._fsm.stopRecord();
  }

  hold(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'hold');
    this._reportCallActionEvent(RTC_CALL_ACTION.HOLD);
    this._fsm.hold();
  }

  unhold(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'unhold');
    this._reportCallActionEvent(RTC_CALL_ACTION.UNHOLD);
    this._fsm.unhold();
  }

  mute(
    direction: RTC_CALL_ACTION_DIRECTION = RTC_CALL_ACTION_DIRECTION.LOCAL,
  ): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'mute');
    if (direction === RTC_CALL_ACTION_DIRECTION.LOCAL) {
      this._reportCallActionEvent(RTC_CALL_ACTION.LOCAL_MUTE);
      this._isLocalMute = true;
    }
    if (direction === RTC_CALL_ACTION_DIRECTION.REMOTE) {
      this._reportCallActionEvent(RTC_CALL_ACTION.REMOTE_MUTE);
      this._isRemoteMute = true;
    }
    this._fsm.mute(direction);
    this._onCallActionSuccess(RTC_CALL_ACTION.MUTE, {
      actionDirection: direction,
    });
  }

  unmute(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'unmute');
    this._isLocalMute = false;
    this._isRemoteMute = false;
    this._reportCallActionEvent(RTC_CALL_ACTION.UNMUTE);
    this._fsm.unmute(RTC_CALL_ACTION_DIRECTION.LOCAL);
    this._fsm.unmute(RTC_CALL_ACTION_DIRECTION.REMOTE);
    this._onCallActionSuccess(RTC_CALL_ACTION.UNMUTE, {});
  }

  park(): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'park');
    this._reportCallActionEvent(RTC_CALL_ACTION.PARK);
    this._fsm.park();
  }

  transfer(target: string): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'transfer');
    this._reportCallActionEvent(RTC_CALL_ACTION.TRANSFER);
    if (target.length === 0) {
      this._onCallActionFailed(RTC_CALL_ACTION.TRANSFER, RTC_CALL_ACTION_ERROR_CODE.INVALID,);
      return;
    }
    this._fsm.transfer(target);
  }

  warmTransfer(callUuid: string): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, RTC_CALL_ACTION.WARM_TRANSFER);
    this._reportCallActionEvent(RTC_CALL_ACTION.WARM_TRANSFER);
    const targetCall = this._account.getCallByUuid(callUuid);
    if (!targetCall || !targetCall.getCallSession()) {
      rtcLogger.warn(
        LOG_TAG,
        'Can get call or call session from input call uuid',
      );
      this._onCallActionFailed(RTC_CALL_ACTION.WARM_TRANSFER, RTC_CALL_ACTION_ERROR_CODE.INVALID);
      return;
    }
    this._fsm.warmTransfer(targetCall.getCallSession());
  }

  forward(target: string): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'forward');
    this._reportCallActionEvent(RTC_CALL_ACTION.FORWARD);
    if (target.length === 0 || !this._isIncomingCall) {
      this._onCallActionFailed(RTC_CALL_ACTION.FORWARD, RTC_CALL_ACTION_ERROR_CODE.INVALID,);
      return;
    }
    this._fsm.forward(target);
  }

  dtmf(digits: string): void {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'dtmf');
    this._reportCallActionEvent(RTC_CALL_ACTION.DTMF);
    if (digits.length === 0) {
      return;
    }
    this._fsm.dtmf(digits);
  }

  private _reportCallActionEvent(callAction: RTC_CALL_ACTION) {
    this._report.updateCallEvent(
      CallEventCategory.CallAction,
      callAction,
    );
  }

  onAccountReady() {
    if (!this.isIncomingCall()) {
      this._fsm.accountReady();
    }
  }

  onAccountNotReady() {
    if (!this.isIncomingCall()) {
      this._fsm.accountNotReady();
      this._report.updateCallEvent(
        CallEventCategory.RegistrationError,
        `${this._account.getRegistrationStatusCode()}`,
      );
    }
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

  getCallSession(): any {
    return this._callSession.getSession();
  }

  private _prepare(): void {
    // listen session
    this._callSession.on(CALL_SESSION_STATE.ACCEPTED, () => {
      // Update party id and session id in invite response sip message
      const inviteRes = this._callSession.getInviteResponse();
      if (inviteRes && inviteRes.headers) {
        const key = this._isIncomingCall
          ? CALL_REPORT_PROPS.SENT_200_OK_TIME
          : CALL_REPORT_PROPS.RECEIVED_200_OK_TIME;
        this._report.updateEstablishment(key);
        this._parseRcApiIds(inviteRes.headers);
      } else {
        rtcLogger.warn(
          LOG_TAG,
          "Can't get invite response for parsing partyid and sessionid",
        );
      }
      this._onSessionAccepted();
    });
    this._callSession.on(CALL_SESSION_STATE.CONFIRMED, (response: any) => {
      if (this._isIncomingCall && response && response.headers) {
        this._report.updateEstablishment(CALL_REPORT_PROPS.RECEIVED_ACK_TIME);
      }
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
      (
        callAction: RTC_CALL_ACTION,
        code: number = RTC_CALL_ACTION_ERROR_CODE.INVALID,
      ) => {
        this._onCallActionFailed(callAction, code);
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
      if (!this._connectedTimestamp) {
        this._connectedTimestamp = new Date();
      }
      this._setSipInfoIntoCallInfo();
      this._clearHangupTimer();
      this._isLocalMute
        ? this._callSession.mute(RTC_CALL_ACTION_DIRECTION.LOCAL)
        : this._callSession.unmute(RTC_CALL_ACTION_DIRECTION.LOCAL);

      this._isRemoteMute
        ? this._callSession.mute(RTC_CALL_ACTION_DIRECTION.REMOTE)
        : this._callSession.unmute(RTC_CALL_ACTION_DIRECTION.REMOTE);
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
    this._fsm.on(CALL_FSM_NOTIFY.WARM_TRANSFER_ACTION, (targetSession: any) => {
      this._onWarmTransferAction(targetSession);
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
    this._fsm.on(
      CALL_FSM_NOTIFY.MUTE_ACTION,
      (direction: RTC_CALL_ACTION_DIRECTION) => {
        this._onMuteAction(direction);
      },
    );
    this._fsm.on(
      CALL_FSM_NOTIFY.UNMUTE_ACTION,
      (direction: RTC_CALL_ACTION_DIRECTION) => {
        this._onUnmuteAction(direction);
      },
    );
    this._fsm.on(CALL_FSM_NOTIFY.DTMF_ACTION, (digits: string) => {
      this._onDtmfAction(digits);
    });
    this._fsm.on(CALL_FSM_NOTIFY.START_REPLY_ACTION, () => {
      this._onStartReplyAction();
    });
    this._fsm.on(
      CALL_FSM_NOTIFY.REPLY_WITH_PATTERN_ACTION,
      (
        pattern: RTC_REPLY_MSG_PATTERN,
        time: number,
        timeUnit: RTC_REPLY_MSG_TIME_UNIT,
      ) => {
        this._onReplyWithPatternAction(pattern, time, timeUnit);
      },
    );
    this._fsm.on(CALL_FSM_NOTIFY.REPLY_WITH_MESSAGE_ACTION, (msg: string) => {
      this._onReplyWithMessageAction(msg);
    });
    this._fsm.on(
      CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
      (callAction: RTC_CALL_ACTION, code: number = -1) => {
        this._onCallActionFailed(callAction, code);
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
    this._fsm.on(CALL_FSM_NOTIFY.HOLD_SUCCESS_ACTION, () => {
      this._onCallActionSuccess(RTC_CALL_ACTION.HOLD);
    });
    this._fsm.on(CALL_FSM_NOTIFY.HOLD_FAILED_ACTION, () => {
      this._onCallActionFailed(
        RTC_CALL_ACTION.HOLD,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
    });
    this._fsm.on(CALL_FSM_NOTIFY.UNHOLD_SUCCESS_ACTION, () => {
      this._onCallActionSuccess(RTC_CALL_ACTION.UNHOLD);
    });
    this._fsm.on(CALL_FSM_NOTIFY.UNHOLD_FAILED_ACTION, () => {
      this._onCallActionFailed(
        RTC_CALL_ACTION.UNHOLD,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
    });
  }

  private _destroy() {
    this._maybeNotifyNoAudioEvent();
    this._callSession.removeAllListeners();
    this._callSession.destroy();
    this._report.destroy();
  }

  private _maybeNotifyNoAudioEvent() {
    if (!this._connectedTimestamp) {
      return;
    }
    const sessionTime =
      (new Date().valueOf() - this._connectedTimestamp.valueOf()) / 1000;
    if (sessionTime < 5) {
      return;
    }
    const hasSent = this._callSession.hasSentPackages();
    const hasReceived = this._callSession.hasReceivedPackages();
    if (hasSent && hasReceived) {
      this._notifyNoAudioStateEvent();
    } else if (hasSent && !hasReceived) {
      this._notifyNoAudioDataEvent(
        sessionTime,
        RTC_NO_AUDIO_TYPE.NO_RTP_INCOMING,
      );
    } else if (!hasSent && hasReceived) {
      this._notifyNoAudioDataEvent(
        sessionTime,
        RTC_NO_AUDIO_TYPE.NO_RTP_OUTGOING,
      );
    } else {
      this._notifyNoAudioDataEvent(sessionTime, RTC_NO_AUDIO_TYPE.NO_RTP);
    }
  }

  private _notifyNoAudioStateEvent() {
    const noAudioStateEvent: RTCNoAudioStateEvent = {
      event: {
        type: 'success',
        details: {
          feature: 'no_audio_data',
        },
      },
    };
    rtcLogger.debug(
      LOG_TAG,
      `Notify no audio state event: ${JSON.stringify(noAudioStateEvent)}`,
    );
    this._account &&
      this._account.notifyNoAudioStateEvent(
        this._callInfo.uuid,
        noAudioStateEvent,
      );
  }

  private _notifyNoAudioDataEvent(
    sessionTime: number,
    noAudioType: RTC_NO_AUDIO_TYPE,
  ) {
    const noAudioDataEvent: RTCNoAudioDataEvent = {
      event: {
        type: 'no-rtp',
        details: {
          feature: 'no_audio_data',
          data: {
            call_type: this._isIncomingCall ? 'Incoming' : 'Outgoing',
            user_agent: this._userAgent,
            session_time: sessionTime,
            type: noAudioType,
            call_info: {
              to_tag: this._callInfo.toTag ? this._callInfo.toTag : '',
              to_number: this._callInfo.toNum,
              to_name: this._callInfo.toName,
              call_id: this._callInfo.callId ? this._callInfo.callId : '',
              from_tag: this._callInfo.fromTag ? this._callInfo.fromTag : '',
              from_number: this._callInfo.fromNum,
              from_name: this._callInfo.fromName,
            },
          },
        },
      },
    };
    rtcLogger.debug(
      LOG_TAG,
      `Notify no audio data event: ${JSON.stringify(noAudioDataEvent)}`,
    );
    this._account &&
      this._account.notifyNoAudioDataEvent(
        this._callInfo.uuid,
        noAudioDataEvent,
      );
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
      default:
        break;
    }
    this._notifyCallActionSuccess(callAction, options);
  }

  private _notifyCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions) {
      let action;
      if (callAction === RTC_CALL_ACTION.MUTE) {
        if (options.actionDirection === RTC_CALL_ACTION_DIRECTION.LOCAL) {
          action = RTC_CALL_ACTION.LOCAL_MUTE;
        } else {
          action = RTC_CALL_ACTION.REMOTE_MUTE;
        }
      } else {
        action = callAction;
      }
      this._report.updateCallEvent(
        CallEventCategory.CallActionSuccess,
        `${action}`,
      );
      if (this._delegate) {
        this._delegate.onCallActionSuccess(callAction, options);
      }
  }

  private _onCallActionFailed(callAction: RTC_CALL_ACTION, code: number) {
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
    this._notifyCallActionFailed(callAction, code);
  }

  private _notifyCallActionFailed(callAction: RTC_CALL_ACTION, code: number) {
    this._report.updateCallEvent(
      CallEventCategory.CallActionFailed,
      `${callAction}`,
    );
    if (this._delegate) {
      rtcLogger.warn(
        LOG_TAG,
        `Call action ${callAction} Failed. Error code: ${code}`,
      );
      this._delegate.onCallActionFailed(callAction, code);
    }
  }

  private _clearHangupTimer() {
    if (this._hangupInvalidCallTimer) {
      clearTimeout(this._hangupInvalidCallTimer);
      this._hangupInvalidCallTimer = null;
    }
  }

  private _setSipInfoIntoCallInfo() {
    const session = this._callSession.getSession();
    if (!session) {
      return;
    }

    this._callInfo.callId = session.dialog.id.callId || '';
    this._callInfo.fromTag = session.dialog.id.remoteTag || '';
    this._callInfo.toTag = session.dialog.id.localTag || '';

    rtcLogger.info(
      LOG_TAG,
      `set sip info callId=${this._callInfo.callId}; fromTag=${
        this._callInfo.fromTag
      }; toTag=${this._callInfo.toTag}; to call info`,
    );
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
    if (response.statusCode === 183) {
      rtcLogger.info(
        LOG_TAG,
        `receive call ${response.statusCode} status code`,
      );
      this._report.updateEstablishment(CALL_REPORT_PROPS.RECEIVED_183_TIME);
      this._setSipInfoIntoCallInfo();
      this._clearHangupTimer();
    }
  }

  private _onSessionReinviteAccepted(session: any) {
    if (
      SDH_DIRECTION.SEND_ONLY ===
      session.sessionDescriptionHandler.getDirection()
    ) {
      this._fsm.holdSuccess();
    } else {
      this._fsm.unholdSuccess();
    }
  }

  private _onSessionReinviteFailed(session: any) {
    if (
      SDH_DIRECTION.SEND_ONLY ===
      session.sessionDescriptionHandler.getDirection()
    ) {
      this._fsm.holdFailed();
    } else {
      this._fsm.unholdFailed();
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

  private _onWarmTransferAction(targetSession: any) {
    this._callSession.warmTransfer(targetSession);
  }

  private _onForwardAction(target: string) {
    this._callSession.forward(target);
  }

  private _onParkAction() {
    this._callSession.park();
  }

  private _onStartRecordAction() {
    if (RECORD_STATE.RECORDING === this._recordState) {
      this._notifyCallActionSuccess(RTC_CALL_ACTION.START_RECORD, {});
    } else if (RECORD_STATE.IDLE === this._recordState) {
      this._recordState = RECORD_STATE.START_RECORD_IN_PROGRESS;
      this._callSession.startRecord();
    } else {
      this._notifyCallActionFailed(
        RTC_CALL_ACTION.START_RECORD,
        RTC_CALL_ACTION_ERROR_CODE.OTHER_ACTION_IN_PROGRESS
      );
    }
  }

  private _onStopRecordAction() {
    if (RECORD_STATE.RECORDING === this._recordState) {
      this._recordState = RECORD_STATE.STOP_RECORD_IN_PROGRESS;
      this._callSession.stopRecord();
    } else if (RECORD_STATE.IDLE === this._recordState) {
      this._notifyCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD, {});
    } else {
      this._notifyCallActionFailed(
        RTC_CALL_ACTION.STOP_RECORD,
        RTC_CALL_ACTION_ERROR_CODE.OTHER_ACTION_IN_PROGRESS
      );
    }
  }

  private _onMuteAction(direction: RTC_CALL_ACTION_DIRECTION) {
    this._callSession.mute(direction);
  }

  private _onUnmuteAction(direction: RTC_CALL_ACTION_DIRECTION) {
    this._callSession.unmute(direction);
  }

  private _onDtmfAction(digits: string) {
    this._callSession.dtmf(digits);
  }

  private _onStartReplyAction() {
    this._callSession.startReply();
  }

  private _onReplyWithPatternAction(
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT,
  ) {
    this._callSession.replyWithPattern(pattern, time, timeUnit);
  }

  private _onReplyWithMessageAction(msg: string) {
    this._callSession.replyWithMessage(msg);
  }

  private _onCreateOutingCallSession() {
    this._report.updateEstablishment(CALL_REPORT_PROPS.INVITE_SENT_TIME);
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
    const idMap = apiIds[0]['raw']
      .split(';')
      .map((sub: string) => sub.split('='));
    this._callInfo.partyId = idMap[0][1];
    this._callInfo.sessionId = idMap[1][1];
    this._report.update(CALL_REPORT_PROPS.SESSION_ID, this._callInfo.sessionId);
    rtcLogger.info(
      LOG_TAG,
      `Got party id=${this._callInfo.partyId} session id=${
        this._callInfo.sessionId
      }`,
    );
  }
}

export { RTCCall };
