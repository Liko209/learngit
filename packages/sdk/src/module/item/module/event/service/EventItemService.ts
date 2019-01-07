/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { Item } from '../../../entity';

class EventItemService extends EntityBaseService implements ISubItemService {
  constructor() {
    super();
  }

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }

  updateItem(item: Item) {}

  createItem(item: Item) {}

  deleteItem(itemId: number) {}
}

export { EventItemService };
