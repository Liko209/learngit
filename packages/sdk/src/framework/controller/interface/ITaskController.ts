/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 08:40:37
 * Copyright © RingCentral. All rights reserved.
 */

import { ITaskStrategy } from '../../strategy/interface/ITaskStrategy';

interface ITaskController {
  start(strategy: ITaskStrategy): void;
}

export { ITaskController };
