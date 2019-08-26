/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 18:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from './Model';

export type DisplayNameModel = IdModel & {
  displayName: string;
};

export type SortableModel<T> = DisplayNameModel & {
  sortWeights: number[];
  lowerCaseName: string;
  entity: T;
  extraData?: any[];
};
