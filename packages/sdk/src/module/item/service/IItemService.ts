/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 13:20:57
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';

interface IItemService {
  getItems(
    typeId: number,
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): Promise<Item[]>;

  handleSanitizedItems(items: Item[]): void;

  createItem(item: Item): Promise<void>;

  updateItem(item: Item): Promise<void>;

  deleteItem(itemId: number): Promise<void>;
}
export { IItemService };
