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
    const { decorators } = configManager.getConfig();
    const logEntity: LogEntity = decorators.reduce((preEntity, curLoader) => {
      return curLoader.decorate(preEntity);
    },                                             initLogEntity);
    return logEntity;
  }

}
