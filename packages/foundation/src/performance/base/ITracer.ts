/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-29 10:23:08
 * Copyright © RingCentral. All rights reserved.
 */

export interface ITracer {
  start(): void;

  stop(): void;

  record(
    startTime: number,
    duration: number,
    options?: {
      metrics?: { [key: string]: number };
      attributes?: { [key: string]: string };
    },
  ): void;

  incrementMetric(metricName: string, num?: number): void;

  putMetric(metricName: string, num: number): void;

  getMetric(metricName: string): number;

  putAttribute(attr: string, value: string): void;

  getAttribute(attr: string): string | undefined;

  removeAttribute(attr: string): void;

  getAttributes(): { [key: string]: string };
}
