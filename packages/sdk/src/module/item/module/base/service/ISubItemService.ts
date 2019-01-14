/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:25:06
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';
import { ItemQueryOptions } from '../../../types';
import { RIGHT_RAIL_ITEM_TYPE } from '../../../../constants';

interface ISubItemService {
  getSortedIds(options: ItemQueryOptions): Promise<number[]>;

  updateItem(item: Item): void;

  deleteItem(itemId: number): void;

  createItem(item: Item): void;

  getSubItemsCount(
    groupId: number,
    type: RIGHT_RAIL_ITEM_TYPE,
  ): Promise<number>;
}

export { ISubItemService };
