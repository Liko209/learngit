import { EventEmitter2 } from 'eventemitter2';
interface IRTCCallSession extends EventEmitter2 {
  setSession(session: any): void;
  hangup(): void;
}

export { IRTCCallSession };
