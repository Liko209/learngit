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
import { TELEPHONY_CALL_STATE } from '../types';

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
    let callState = TELEPHONY_CALL_STATE.IDLE;
    switch (state) {
      case RTC_CALL_STATE.CONNECTED:
        callState = TELEPHONY_CALL_STATE.CONNECTED;
        break;
      case RTC_CALL_STATE.CONNECTING:
        callState = TELEPHONY_CALL_STATE.CONNECTING;
        break;
      case RTC_CALL_STATE.DISCONNECTED:
        callState = TELEPHONY_CALL_STATE.DISCONNECTED;
        break;
    }
    this._callDelegate.onCallStateChange(
      this._rtcCall.getCallInfo().uuid,
      callState,
    );
  }

  onCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {}

  onCallActionFailed(callAction: RTC_CALL_ACTION) {}

  hangUp() {
    this._rtcCall.hangup();
  }
}

export { TelephonyCallController };
