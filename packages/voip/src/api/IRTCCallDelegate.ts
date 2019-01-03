/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:12
 * Copyright © RingCentral. All rights reserved.
 */
import { RTC_CALL_STATE } from './types';
interface IRTCCallDelegate {
  onCallStateChange(state: RTC_CALL_STATE): void;
}

export { IRTCCallDelegate };
