/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-29 10:46:30
 * Copyright © RingCentral. All rights reserved.
 */

import { ITracer } from './ITracer';

export interface IPerformance {
  initialize(): Promise<void>;

  getTracer(traceName: string): ITracer;
}
