/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 00:28:47
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { ItemQueryOptions, ItemFilterFunction } from '../../../types';
import { Item, SanitizedItem } from '../entity';
import { SubItemDao } from '../dao';
import { BaseDao } from 'sdk/framework/dao';
import NetworkClient from 'sdk/api/NetworkClient';

class BaseSubItemService<K extends Item, T extends SanitizedItem>
  extends EntityBaseService<K>
  implements ISubItemService {
  constructor(
    private _subItemDao: SubItemDao<T>,
    dao?: BaseDao<K>,
    networkConfig?: { basePath: string; networkClient: NetworkClient },
  ) {
    super({ isSupportedCache: false }, dao, networkConfig);
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    return await this._subItemDao.getSortedIds(options);
  }

  async getSubItemsCount(groupId: number, filterFunc?: ItemFilterFunction) {
    return await this._subItemDao.getGroupItemCount(groupId, filterFunc);
  }
}

export { BaseSubItemService };
