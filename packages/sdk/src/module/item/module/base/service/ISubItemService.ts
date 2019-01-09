/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:25:06
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';
interface ISubItemService {
  getSortedIds(
    groupId: number,
    limit: number,
    offsetItemId: number,
    sortKey: string,
    desc: boolean,
  ): Promise<number[]>;

  updateItem(item: Item): void;

  deleteItem(itemId: number): void;

  createItem(item: Item): void;

  getSubItemsCount(groupId: number): Promise<number>;
}

export { ISubItemService };
