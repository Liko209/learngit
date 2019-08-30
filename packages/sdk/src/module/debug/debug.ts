/*
 * @Author: Paynter Chen
 * @Date: 2019-07-08 10:42:54
 * Copyright © RingCentral. All rights reserved.
 */
import { IDebugModule } from './types';
import { debugLog } from './log';
import { data } from './data';

const DEBUG_TAG = '_debug';

class Debug {
  private _instance: object = {};

  constructor() {
    this._init();
  }

  private _init() {
    window[DEBUG_TAG] = this._instance;
    this.inject('log', debugLog.get());
    this.inject('data', data.get());
  }

  inject(name: string, m: IDebugModule) {
    this._instance[name] = m;
  }
}

const debug = new Debug();
export { debug };
