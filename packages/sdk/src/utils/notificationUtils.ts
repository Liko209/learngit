/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-19 19:36:28
 * Copyright © RingCentral. All rights reserved.
 */
import { SYNC_SOURCE } from '../module/sync/types';

function shouldEmitNotification(source?: SYNC_SOURCE) {
  return source !== SYNC_SOURCE.REMAINING;
}

export { shouldEmitNotification };
