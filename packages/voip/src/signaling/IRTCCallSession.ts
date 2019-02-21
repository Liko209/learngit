/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:06
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';

interface IRTCCallSession extends EventEmitter2 {
  destroy(): void;
  setSession(session: any): void;
  getInviteResponse(): any;
  hangup(): void;
  flip(target: number): void;
  transfer(target: string): void;
  startRecord(): void;
  stopRecord(): void;
  answer(): void;
  reject(): void;
  mute(): void;
  unmute(): void;
  park(): void;
  sendToVoicemail(): void;
  hold(): void;
  unhold(): void;
  dtmf(digits: string): void;
  getPeerConnection(): any;
  getMediaStats(onMediaStat: any, interval: number): void;
  stopMediaStats(): void;
}

export { IRTCCallSession };
