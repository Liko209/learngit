/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import { RTC_ACCOUNT_STATE } from 'voip';
interface ITelephonyAccountDelegate {
  onAccountStateChanged(state: RTC_ACCOUNT_STATE): void;
  onMadeOutgoingCall(callId: number): void;
  onReceiveIncomingCall(callId: number): void;
}

export { ITelephonyAccountDelegate, RTC_ACCOUNT_STATE };
