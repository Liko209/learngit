/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:12
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCALL_STATE, RTC_CALL_ACTION } from './types';
interface IRTCCallObserver {
  onCallStateChange(state: RTCCALL_STATE): void;
  onCallActionSuccess(callAction: RTC_CALL_ACTION): void;
  onCallActionFailed(callAction: RTC_CALL_ACTION): void;
}

export { IRTCCallObserver, RTCCALL_STATE };
