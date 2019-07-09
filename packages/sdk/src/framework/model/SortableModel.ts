/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 18:00:00
 * Copyright © RingCentral. All rights reserved.
 */

export type SortableModel<T> = {
  id: number;
  displayName: string;
  sortWeights: number[];
  lowerCaseName: string;
  entity: T;
  extraData?: any[];
};
