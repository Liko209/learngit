/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:17:51
 * Copyright © RingCentral. All rights reserved.
 */
import { RTC_CALL_STATE } from 'voip';

interface ITelephonyCallDelegate {
  onCallStateChange(callId: string, state: RTC_CALL_STATE): void;
}

export { ITelephonyCallDelegate, RTC_CALL_STATE };
