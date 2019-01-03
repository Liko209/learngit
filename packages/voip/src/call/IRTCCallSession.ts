/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:19
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';

interface IRTCCallSession extends EventEmitter2 {
  setSession(session: any): void;
  hangup(): void;
  flip(target: number): void;
  startRecord(): void;
  stopRecord(): void;
  answer(): void;
  reject(): void;
  sendToVoicemail(): void;
}

export { IRTCCallSession };
