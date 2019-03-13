/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:17:51
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
} from 'voip';

interface ITelephonyCallDelegate {
  onCallStateChange(callId: string, state: RTC_CALL_STATE): void;
  onCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ): void;
  onCallActionFailed(callAction: RTC_CALL_ACTION): void;
}

export {
  ITelephonyCallDelegate,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
};
