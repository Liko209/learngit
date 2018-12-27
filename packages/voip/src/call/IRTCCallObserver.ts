import { RTCCALL_STATE } from './types';
interface IRTCCallObserver {
  onCallStateChange(state: RTCCALL_STATE): void;
}

export { IRTCCallObserver, RTCCALL_STATE };
