/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:32:27
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IRTCCallDelegate,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
  RTCCall,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'voip';
import { ITelephonyCallDelegate } from '../service/ITelephonyCallDelegate';
import { CallStateCallback } from '../types';

class TelephonyCallController implements IRTCCallDelegate {
  private _callDelegate: ITelephonyCallDelegate;
  private _rtcCall: RTCCall;
  private _callback: CallStateCallback;

  constructor(delegate: ITelephonyCallDelegate) {
    this._callDelegate = delegate;
  }

  setRtcCall(call: RTCCall) {
    this._rtcCall = call;
  }

  setCallStateCallback(callback: CallStateCallback) {
    this._callback = callback;
  }

  onCallStateChange(state: RTC_CALL_STATE) {
    this._callDelegate.onCallStateChange(
      this._rtcCall.getCallInfo().uuid,
      state,
    );
    if (this._callback) {
      this._callback(this._rtcCall.getCallInfo().uuid, state);
    }
  }

  onCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    this._callDelegate.onCallActionSuccess(callAction, options);
  }

  onCallActionFailed(callAction: RTC_CALL_ACTION) {
    this._callDelegate.onCallActionFailed(callAction);
  }

  hangUp() {
    this._rtcCall.hangup();
  }

  mute() {
    this._rtcCall.mute();
  }

  unmute() {
    this._rtcCall.unmute();
  }

  hold() {
    this._rtcCall.hold();
  }

  unhold() {
    this._rtcCall.unhold();
  }

  startRecord() {
    this._rtcCall.startRecord();
  }

  stopRecord() {
    this._rtcCall.stopRecord();
  }

  dtmf(digits: string) {
    this._rtcCall.dtmf(digits);
  }

  answer() {
    this._rtcCall.answer();
  }

  sendToVoiceMail() {
    this._rtcCall.sendToVoicemail();
  }

  ignore() {
    this._rtcCall.ignore();
  }

  startReply() {
    this._rtcCall.startReply();
  }

  replyWithMessage(message: string) {
    this._rtcCall.replyWithMessage(message);
  }

  replyWithPattern(
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT,
  ) {
    this._rtcCall.replyWithPattern(pattern, time, timeUnit);
  }
}

export { TelephonyCallController };
