/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-03 20:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { PerformanceItem } from './types';
import { mainLogger } from 'foundation';

class PerformanceTracer {
  PERFORMANCE_KEY = 'jupiter';
  scenarios: Map<number, number>;
  keys: Map<number, string>;

  constructor() {
    this.scenarios = new Map<number, number>();
    this.keys = new Map<number, string>();
  }

  start(key: string, id: number) {
    if (this.scenarios.has(id)) {
      mainLogger.info(`performanceStart already has key ${key}`);
    } else {
      this.scenarios.set(id, performance.now());
      this.keys.set(id, key);
    }
  }

  end(id: number, count?: number) {
    if (this.scenarios.has(id)) {
      const startTime = this.scenarios.get(id);
      if (startTime) {
        const endTime = performance.now();
        const key = this.keys.get(id);
        if (key) {
          this.tracePerformance(key, { startTime, endTime });
          mainLogger.info(
            key,
            ':',
            String(endTime - startTime),
            ', count:',
            count,
          );
        }
      }
      this.scenarios.delete(id);
      this.keys.delete(id);
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
