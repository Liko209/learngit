/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:06
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';

enum CALL_SESSION_STATE {
  CONFIRMED = 'callsessionstate.confirmed',
  DISCONNECTED = 'callsessionstate.disconnected',
  ERROR = 'callsessionstate.error',
}
interface IRTCCallSession extends EventEmitter2 {
  setSession(session: any): void;
  hangup(): void;
}

export { IRTCCallSession, CALL_SESSION_STATE };
