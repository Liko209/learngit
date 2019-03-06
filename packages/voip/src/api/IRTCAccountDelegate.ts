/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import { RTC_ACCOUNT_STATE } from './types';
import { RTCCall } from './RTCCall';

interface IRTCAccountDelegate {
  onAccountStateChanged(accountState: RTC_ACCOUNT_STATE): void;
  onMadeOutgoingCall(call: RTCCall): void;
  onReceiveIncomingCall(call: RTCCall): void;
  onReceiveNewProvFlags(sipFlags: object): void;
}

export { IRTCAccountDelegate };
