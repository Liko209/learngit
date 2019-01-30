/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-03 20:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { PerformanceItem } from './types';
import { mainLogger } from 'foundation';

class PerformanceTracer {
  PERFORMANCE_KEY = 'jupiter';
  scenarios: Map<string, number>;

  constructor() {
    this.scenarios = new Map<string, number>();
  }

  start(key: string) {
    if (this.scenarios.has(key)) {
      mainLogger.error(`performanceStart already has key ${key}`);
    } else {
      this.scenarios.set(key, performance.now());
    }
  }

  end(key: string) {
    if (this.scenarios.has(key)) {
      const startTime = this.scenarios.get(key);
      if (startTime) {
        const endTime = performance.now();
        this.tracePerformance(key, { startTime, endTime });
        mainLogger.info(key, ':', String(endTime - startTime));
      }
      this.scenarios.delete(key);
    }
  }

  tracePerformance(key: string, item: PerformanceItem) {
    if (!performance[this.PERFORMANCE_KEY]) {
      performance[this.PERFORMANCE_KEY] = {};
    }
    if (!performance[this.PERFORMANCE_KEY][key]) {
      performance[this.PERFORMANCE_KEY][key] = [];
    }
    performance[this.PERFORMANCE_KEY][key].push(item);
  }
}

export { PerformanceTracer };
