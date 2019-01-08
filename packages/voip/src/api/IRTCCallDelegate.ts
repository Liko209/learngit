/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:12
 * Copyright © RingCentral. All rights reserved.
 */
import { RTC_CALL_STATE, RTC_CALL_ACTION } from './types';
interface IRTCCallDelegate {
  onCallStateChange(state: RTC_CALL_STATE): void;
  onCallActionSuccess(action: RTC_CALL_ACTION): void;
  onCallActionFailed(action: RTC_CALL_ACTION): void;
}

export { IRTCCallDelegate };
