/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-29 09:03:41
 * Copyright © RingCentral. All rights reserved.
 */

import { ITracer } from './ITracer';

class Tracer implements ITracer {
  private _trace: ITracer | null;

  constructor(trace: ITracer | null) {
    this._trace = trace;
  }

  start(): void {
    if (this._trace) {
      this._trace.start();
    }
  }

  stop(): void {
    if (this._trace) {
      this._trace.stop();
    }
  }

  record(
    startTime: number,
    duration: number,
    options?: {
      metrics?: { [key: string]: number };
      attributes?: { [key: string]: string };
    },
  ): void {
    if (this._trace) {
      this._trace.record(startTime, duration, options);
    }
  }

  incrementMetric(metricName: string, num?: number): void {
    if (this._trace) {
      this._trace.incrementMetric(metricName, num);
    }
  }

  putMetric(metricName: string, num: number): void {
    if (this._trace) {
      this._trace.putMetric(metricName, num);
    }
  }

  getMetric(metricName: string): number {
    if (this._trace) {
      return this._trace.getMetric(metricName);
    }
    return 0;
  }

  putAttribute(attr: string, value: string): void {
    if (this._trace) {
      this._trace.putAttribute(attr, value);
    }
  }

  getAttribute(attr: string): string | undefined {
    if (this._trace) {
      return this._trace.getAttribute(attr);
    }
    return undefined;
  }

  removeAttribute(attr: string): void {
    if (this._trace) {
      this._trace.removeAttribute(attr);
    }
  }

  getAttributes(): { [key: string]: string } {
    if (this._trace) {
      return this._trace.getAttributes();
    }
    return {};
  }
}

export { Tracer };
