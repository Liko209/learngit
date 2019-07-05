/*
 * @Author: Paynter Chen
 * @Date: 2019-05-05 16:33:26
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
export function createWorker(worker: any) {
  return _.isFunction(worker) ? worker() : null;
}
