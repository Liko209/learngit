/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:12
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCALL_STATE } from './types';
interface IRTCCallObserver {
  onCallStateChange(state: RTCCALL_STATE): void;
}

export { IRTCCallObserver, RTCCALL_STATE };
