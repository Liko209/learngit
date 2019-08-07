/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-29 10:46:30
 * Copyright © RingCentral. All rights reserved.
 */

import { ITracer } from './ITracer';

export interface IPerformance {
  initialize(): Promise<void>;

  putAttribute(attr: string, value: string): void;

  removeAttribute(attr: string): void;

  getAttribute(attr: string): { attr: string; value: string } | undefined;

  getTracer(traceName: string): ITracer;
}
