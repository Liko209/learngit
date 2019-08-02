/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-29 13:15:52
 * Copyright © RingCentral. All rights reserved.
 */

import { IPerformance } from './base/IPerformance';
import { Tracer } from './base/Tracer';

class Performance implements IPerformance {
  private static _instance: Performance;
  private _performance: IPerformance;

  static get instance() {
    if (!Performance._instance) {
      Performance._instance = new Performance();
    }
    return Performance._instance;
  }

  setPerformance(performance: IPerformance) {
    this._performance = performance;
  }

  performance() {
    return this._performance;
  }

  async initialize() {
    this._performance && (await this._performance.initialize());
  }

  getTracer(traceName: string) {
    return new Tracer(
      this._performance && this._performance.getTracer(traceName),
    );
  }
}

export { Performance };
