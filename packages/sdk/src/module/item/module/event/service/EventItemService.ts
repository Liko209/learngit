/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { IItemService } from '../../../service/IItemService';
import { ItemQueryOptions, ItemFilterFunction } from '../../../types';
import { EventItem, SanitizedEventItem } from '../entity';
import { EventItemDao } from '../dao';
import { daoManager } from '../../../../../dao';
import { ItemUtils } from '../../../utils';

class EventItemService extends EntityBaseService implements ISubItemService {
  constructor(itemService: IItemService) {
    super();
  }

  async updateItem(event: EventItem) {
    const sanitizedDao = daoManager.getDao<EventItemDao>(EventItemDao);
    await sanitizedDao.update(this._toSanitizedEvent(event));
  }

  async deleteItem(itemId: number) {
    const sanitizedDao = daoManager.getDao<EventItemDao>(EventItemDao);
    await sanitizedDao.delete(itemId);
  }

  async createItem(event: EventItem) {
    const sanitizedDao = daoManager.getDao<EventItemDao>(EventItemDao);
    await sanitizedDao.put(this._toSanitizedEvent(event));
  }

  private _toSanitizedEvent(event: EventItem) {
    return {
      ...ItemUtils.toSanitizedItem(event),
    } as SanitizedEventItem;
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    const sanitizedDao = daoManager.getDao<EventItemDao>(EventItemDao);
    return await sanitizedDao.getSortedIds(options);
  }

  async getSubItemsCount(groupId: number, filterFunc?: ItemFilterFunction) {
    const sanitizedDao = daoManager.getDao<EventItemDao>(EventItemDao);
    return await sanitizedDao.getGroupItemCount(groupId, filterFunc);
  }
}

export { EventItemService };
