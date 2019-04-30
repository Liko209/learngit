/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 08:40:42
 * Copyright © RingCentral. All rights reserved.
 */

import { ITaskController } from '../interface/ITaskController';
import { ITaskStrategy } from 'sdk/framework/strategy/interface/ITaskStrategy';

class TaskController implements ITaskController {
  private _strategy: ITaskStrategy;

  constructor(strategy: ITaskStrategy) {
    this._strategy = strategy;
  }

  start(executeFunc: () => any) {}
}

export { TaskController };
