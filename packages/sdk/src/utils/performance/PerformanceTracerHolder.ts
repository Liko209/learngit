/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-09 16:24:26
 * Copyright © RingCentral. All rights reserved.
 */
import { PerformanceTracer } from './PerformanceTracer';

class PerformanceTracerHolder {
  private static performanceTracer: PerformanceTracer;

  static getPerformanceTracer() {
    if (!PerformanceTracerHolder.performanceTracer) {
      PerformanceTracerHolder.performanceTracer = new PerformanceTracer();
    }
    return PerformanceTracerHolder.performanceTracer;
  }
}

export { PerformanceTracerHolder };
