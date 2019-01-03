import { EventEmitter2 } from 'eventemitter2';

enum CALL_SESSION_STATE {
  CONFIRMED = 'callsessionstate.confirmed',
  DISCONNECTED = 'callsessionstate.disconnected',
  ERROR = 'callsessionstate.error',
}
interface IRTCCallSession extends EventEmitter2 {
  setSession(session: any): void;
  hangup(): void;
  flip(target: number): void;
  startRecord(): void;
  stopRecord(): void;
}

export { IRTCCallSession, CALL_SESSION_STATE };
