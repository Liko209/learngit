/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:25
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity, ILogEntityProcessor } from './types';
import { configManager } from './config';

export class LogEntityProcessor implements ILogEntityProcessor {

  constructor() {
  }

  process(initLogEntity: LogEntity): LogEntity {
    const { loaders } = configManager.getConfig();
    const logEntity: LogEntity = loaders.reduce((preEntity, curLoader) => {
      return curLoader.handle(preEntity);
    },                                          initLogEntity);
    return logEntity;
  }

}
