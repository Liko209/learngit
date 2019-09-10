/*
 * @Author: Paynter Chen
 * @Date: 2019-07-08 10:42:54
 * Copyright © RingCentral. All rights reserved.
 */

import { IDebugModule } from './types';

export class BaseDebugModule implements IDebugModule {
  private _instance: object = {};

  inject(name: string, m: any) {
    this._instance[name] = m;
  }

  get() {
    return this._instance;
  }
}
