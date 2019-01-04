/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:06
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';

interface IRTCCallSession extends EventEmitter2 {
  setSession(session: any): void;
  hangup(): void;
  answer(): void;
  reject(): void;
  sendToVoicemail(): void;
}

export { IRTCCallSession };
