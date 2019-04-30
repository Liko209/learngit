/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 09:01:26
 * Copyright © RingCentral. All rights reserved.
 */

import { ITaskStrategy } from '../interface/ITaskStrategy';

class TaskStrategy implements ITaskStrategy {
  getNext(): number {
    throw new Error('Method not implemented.');
  }

  canNext(): boolean {
    throw new Error('Method not implemented.');
  }

  reset(): void {
    throw new Error('Method not implemented.');
  }
}
export { TaskStrategy };
