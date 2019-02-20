/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:25:06
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemQueryOptions, ItemFilterFunction } from '../../../types';

interface ISubItemService {
  getSortedIds(options: ItemQueryOptions): Promise<number[]>;

  getSubItemsCount(
    groupId: number,
    filterFunc?: ItemFilterFunction,
  ): Promise<number>;
}

export { ISubItemService };
