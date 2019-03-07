/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-12 23:08:47
 * Copyright © RingCentral. All rights reserved.
 */

import { QUERY_DIRECTION } from '../../dao/constants';
type ItemFilterFunction = (value: any, index?: number) => boolean;

type ItemQueryOptions = {
  typeId: number;
  groupId: number;
  sortKey: string;
  desc: boolean;
  limit: number;
  offsetItemId: number | undefined;
  filterFunc?: ItemFilterFunction;
  direction?: QUERY_DIRECTION;
};

export { ItemQueryOptions, ItemFilterFunction };
