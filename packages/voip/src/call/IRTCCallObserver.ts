import { RTCCALL_STATE, RTCCALL_ACTION } from './types';
interface IRTCCallObserver {
  onCallStateChange(state: RTCCALL_STATE): void;
  onCallAction(state: RTCCALL_ACTION): void;
}

export { IRTCCallObserver, RTCCALL_STATE };
