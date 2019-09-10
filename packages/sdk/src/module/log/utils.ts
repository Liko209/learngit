/*
 * @Author: Paynter Chen
 * @Date: 2019-05-05 16:33:26
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity } from 'foundation/log';
import { LogGlobalConfig } from './config/LogGlobalConfig';
import { v4 } from 'uuid';

export function createWorker(worker: any) {
  const Worker = worker.default ? worker.default : worker;
  return new Worker();
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

export const getClientId = (() => {
  let clientId: string;
  return function(disableCache?: boolean) {
    if (clientId && !disableCache) return clientId;
    if (LogGlobalConfig.getClientId()) {
      clientId = LogGlobalConfig.getClientId();
    } else {
      clientId = v4();
      LogGlobalConfig.setClientId(clientId);
    }
    return clientId;
  };
})();
