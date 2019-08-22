/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:06
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import {
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTC_CALL_ACTION_DIRECTION,
} from '../api/types';

interface IRTCCallSession extends EventEmitter2 {
  destroy(): void;
  setSession(session: any): void;
  getSession(): any;
  getInviteResponse(): any;
  hangup(): void;
  flip(target: number): void;
  transfer(target: string): void;
  warmTransfer(targetSession: any): void;
  forward(target: string): void;
  startRecord(): void;
  stopRecord(): void;
  answer(): void;
  reject(): void;
  mute(direction: RTC_CALL_ACTION_DIRECTION): void;
  unmute(direction: RTC_CALL_ACTION_DIRECTION): void;
  park(): void;
  sendToVoicemail(): void;
  hold(): void;
  unhold(): void;
  dtmf(digits: string): void;
  startReply(): void;
  replyWithPattern(
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT,
  ): void;
  replyWithMessage(message: string): void;
  reconnectMedia(options: any): void;
  getMediaStats(callback: any, interval: number): void;
  stopMediaStats(): void;
  hasSentPackages(): boolean;
  hasReceivedPackages(): boolean;
}

export { IRTCCallSession };
