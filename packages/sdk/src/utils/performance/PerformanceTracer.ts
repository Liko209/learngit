/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-03 20:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import { PerformanceInfo } from './types';

const LOG_TAG = '[PerformanceTracer]';
class PerformanceTracer {
  private _performanceInfos: PerformanceInfo[] = [];
  private _timeLine: number[] = [];

  static initial(): PerformanceTracer {
    const performanceTracer = new PerformanceTracer();
    performanceTracer.start();
    return performanceTracer;
  }

  start() {
    this._updateTimeLine();
  }

  trace(performanceInfo: PerformanceInfo) {
    const length = this._timeLine.length;
    const start = this._timeLine[length - 1];
    const trace = performance.now();
    this._updateTimeLine(trace);
    performanceInfo.time = trace - start;
    this._performanceInfos.push(performanceInfo);
  }

  end(performanceInfo: PerformanceInfo) {
    const end = performance.now();
    const start = this._timeLine[0];
    performanceInfo.time = end - start;
    this._performanceInfos.unshift(performanceInfo);
    mainLogger.tags(LOG_TAG).info(JSON.stringify(this._performanceInfos));
  }

  private _updateTimeLine(time?: number) {
    this._timeLine.push(time || performance.now());
  }
}

export { PerformanceTracer };
