/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { SortUtils } from '../../../../../framework/utils';
import { IDatabase } from 'foundation';
import { BaseDao } from '../../../../../dao/base';
import { SanitizedItem } from '../entity';
class SubItemDao<T extends SanitizedItem> extends BaseDao<T> {
  constructor(collectionName: string, db: IDatabase) {
    super(collectionName, db);
  }

  async queryItemsByGroupId(groupId: number): Promise<T[]> {
    const query = this.createQuery().contain('group_ids', groupId);
    return query.toArray();
  }

  async getSortedIds(
    groupId: number,
    limit: number,
    offsetItemId: number | undefined,
    sortKey: string,
    desc: boolean,
  ): Promise<number[]> {
    const sanitizedItems = await this.queryItemsByGroupId(groupId);
    const sortFunc = (lhs: T, rhs: T): number => {
      return SortUtils.sortModelByKey(lhs, rhs, sortKey, desc);
    };

    const sortedItems = sanitizedItems.sort(sortFunc);
    const itemIds: number[] = [];
    let insertAble: boolean = offsetItemId ? false : true;
    for (let i = 0; i < sortedItems.length; ++i) {
      const itemId = sortedItems[i].id;
      if (!insertAble && itemId === offsetItemId) {
        insertAble = true;
      }
      if (insertAble) {
        if (itemIds.length < limit) {
          itemIds.push(itemId);
        } else {
          break;
        }
      }
    }

    return itemIds;
  }

  async getGroupItemCount(groupId: number) {
    const query = this.createQuery().contain('group_ids', groupId);
    return query.count();
  }
}

export { SubItemDao };
