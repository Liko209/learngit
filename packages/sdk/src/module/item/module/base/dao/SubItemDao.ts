/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { SortUtils } from '../../../SortUtils';
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
    offsetItemId: number,
    sortKey: string,
    desc: boolean,
  ): Promise<number[]> {
    const sanitizedItems = await this.queryItemsByGroupId(groupId);
    const sortFunc = (lhs: T, rhs: T): number => {
      return SortUtils.sortModelByKey(lhs, rhs, sortKey, desc);
    };

    const sortedItems = sanitizedItems.sort(sortFunc);
    const itemIds = sortedItems.map(item => item.id);
    let offset = itemIds.indexOf(offsetItemId);
    offset = offset > -1 ? offset : 0;
    const slicedItems = sortedItems.slice(offset, offset + limit);

    return slicedItems.map(item => item.id);
  }

  async getGroupItemCount(groupId: number) {
    const query = this.createQuery().contain('group_ids', groupId);
    return query.count();
  }
}

export { SubItemDao };
