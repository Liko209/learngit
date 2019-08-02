/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTC_ACCOUNT_STATE,
  RTCSipFlags,
  RTCNoAudioStateEvent,
  RTCNoAudioDataEvent,
} from './types';
import { RTCCall } from './RTCCall';

interface IRTCAccountDelegate {
  onAccountStateChanged(accountState: RTC_ACCOUNT_STATE): void;
  onReceiveIncomingCall(call: RTCCall): void;
  onReceiveNewProvFlags(sipFlags: RTCSipFlags): void;
  onNoAudioStateEvent(
    uuid: string,
    noAudioStateEvent: RTCNoAudioStateEvent,
  ): void;
  onNoAudioDataEvent(uuid: string, noAudioDataEvent: RTCNoAudioDataEvent): void;
}

export { IRTCAccountDelegate };
