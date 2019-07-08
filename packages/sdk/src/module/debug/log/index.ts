/*
 * @Author: Paynter Chen
 * @Date: 2019-07-08 10:42:54
 * Copyright © RingCentral. All rights reserved.
 */

import { IDebugModule } from '../types';

class DebugLogModule implements IDebugModule {
  private _instance: object = {};

  constructor() {}

  inject(name: string, m: any) {
    this._instance[name] = m;
  }
}
const debugLog = new DebugLogModule();
export { debugLog };
