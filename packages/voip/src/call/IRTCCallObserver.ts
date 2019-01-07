/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:50:50
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCALL_STATE, RTC_CALL_ACTION } from './types';

interface IRTCCallObserver {
  onCallStateChange(state: RTCCALL_STATE): void;
  onCallActionSuccess(callAction: RTC_CALL_ACTION): void;
  onCallActionFailed(callAction: RTC_CALL_ACTION): void;
}

export { IRTCCallObserver, RTCCALL_STATE };
