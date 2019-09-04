/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:53:11
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTCCallOptions,
  RTCNoAudioStateEvent,
  RTCNoAudioDataEvent,
} from '../api/types';
import { RTCCall } from '../api/RTCCall';

interface IRTCAccount {
  isReady(): boolean;
  createOutgoingCallSession(toNum: string, options: RTCCallOptions): any;
  removeCallFromCallManager(uuid: string): void;
  notifyNoAudioStateEvent(
    uuid: string,
    noAudioStateEvent: RTCNoAudioStateEvent,
  ): void;

  notifyNoAudioDataEvent(
    uuid: string,
    noAudioDataEvent: RTCNoAudioDataEvent,
  ): void;
  getCallByUuid(uuid: string): RTCCall | null;
  getRegistrationStatusCode(): number;
}

export { IRTCAccount };
