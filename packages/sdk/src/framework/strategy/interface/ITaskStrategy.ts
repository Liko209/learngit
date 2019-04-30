/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 08:56:33
 * Copyright © RingCentral. All rights reserved.
 */
interface ITaskStrategy {
  getNext(): number;
  canNext(): boolean;
  reset(): void;
}

export { ITaskStrategy };
