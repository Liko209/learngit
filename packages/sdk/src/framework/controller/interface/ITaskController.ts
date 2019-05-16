/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 08:40:37
 * Copyright © RingCentral. All rights reserved.
 */

interface ITaskController {
  start(executeFunc: () => any): void;
}

export { ITaskController };
