/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { Item } from '../../../entity';
import { IItemService } from '../../../service/IItemService';
import { ItemQueryOptions } from '../../../types';

class EventItemService extends EntityBaseService implements ISubItemService {
  constructor(itemService: IItemService) {
    super();
  }

  getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    return Promise.resolve([]);
  }

  updateItem(item: Item) {}

  createItem(item: Item) {}

  deleteItem(itemId: number) {}

  async getSubItemsCount(groupId: number) {
    return 0;
  }
}

export { EventItemService };
