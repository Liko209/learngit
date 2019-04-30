/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 08:40:42
 * Copyright © RingCentral. All rights reserved.
 */

import { ITaskController } from '../interface/ITaskController';
import { ITaskStrategy } from 'sdk/framework/strategy/interface/ITaskStrategy';

class TaskController implements ITaskController {
  start(info: TaskInfo, strategy: ITaskStrategy) {}
}

export { TaskController };
