/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:25:06
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';
import { ItemQueryOptions, ItemFilterFunction } from '../../../types';

interface ISubItemService {
  getSortedIds(options: ItemQueryOptions): Promise<number[]>;

  updateLocalItem(item: Item): void;

  deleteLocalItem(itemId: number): void;

  createLocalItem(item: Item): void;

  getSubItemsCount(
    groupId: number,
    filterFunc?: ItemFilterFunction,
  ): Promise<number>;
}

export { ISubItemService };
