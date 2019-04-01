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
} from 'voip';
import { ITelephonyCallDelegate } from '../service/ITelephonyCallDelegate';

class TelephonyCallController implements IRTCCallDelegate {
  private _callDelegate: ITelephonyCallDelegate;
  private _rtcCall: RTCCall;

  constructor(delegate: ITelephonyCallDelegate) {
    this._callDelegate = delegate;
  }

  setRtcCall(call: RTCCall) {
    this._rtcCall = call;
  }

  onCallStateChange(state: RTC_CALL_STATE) {
    this._callDelegate.onCallStateChange(
      this._rtcCall.getCallInfo().uuid,
      state,
    );
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
}

export { TelephonyCallController };
