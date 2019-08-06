/*
 * @Author: Paynter Chen
 * @Date: 2019-05-05 16:33:26
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { LogEntity } from 'foundation';

export function createWorker(worker: any) {
  return _.isFunction(worker) ? worker() : null;
}

export function countBy<T>(collection: T[], counter: (item: T) => number) {
  let count = 0;
  collection.forEach(item => {
    count += counter(item);
  });
  return count;
}

export function extractLogMessageLine(log: LogEntity) {
  const { message = '' } = log;
  return `${message}\t\n`;
}
