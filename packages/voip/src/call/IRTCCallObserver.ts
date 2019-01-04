/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:50:50
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCCALL_STATE } from './types';
interface IRTCCallObserver {
  onCallStateChange(state: RTCCALL_STATE): void;
}

export { IRTCCallObserver, RTCCALL_STATE };
