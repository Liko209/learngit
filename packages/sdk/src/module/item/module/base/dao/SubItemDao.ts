/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */
import { IDatabase } from 'foundation/db';
import { isIEOrEdge, isFirefox } from 'sdk/service/utils';
import _ from 'lodash';
import { BaseDao } from 'sdk/framework/dao';
import { SortUtils } from 'sdk/framework/utils';
import { ItemFilterFunction, ItemQueryOptions } from '../../../types';
import { Item, SanitizedItem } from '../entity';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';
import { QUERY_DIRECTION } from '../../../../../dao/constants';

class SubItemDao<T extends SanitizedItem> extends BaseDao<T> {
  constructor(collectionName: string, db: IDatabase) {
    super(collectionName, db);
  }

  async queryItemsByGroupId(groupId: number): Promise<T[]> {
    const query = this._getGroupItemsQuery(groupId);
    return query.toArray();
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    const {
      groupId,
      sortKey,
      desc,
      limit,
      offsetItemId,
      filterFunc,
      direction = QUERY_DIRECTION.NEWER,
    } = options;
    let sanitizedItems = await this.queryItemsByGroupId(groupId);

    if (sanitizedItems.length === 0) {
      return [];
    }

    if (filterFunc) {
      sanitizedItems = sanitizedItems.filter(filterFunc);
    }

    const sortFunc = (lhs: T, rhs: T): number =>
      SortUtils.sortModelByKey(lhs, rhs, [sortKey], desc);

    sanitizedItems = sanitizedItems.sort(sortFunc);
    const allItemIds = sanitizedItems.map((x: T) => x.id);

    const itemIds = ArrayUtils.sliceIdArray(
      allItemIds,
      limit,
      offsetItemId,
      direction,
    );
    return itemIds;
  }

  async getGroupItemCount(groupId: number, filterFunc?: ItemFilterFunction) {
    const query = this._getGroupItemsQuery(groupId);
    if (filterFunc) {
      query.filter((item: SanitizedItem) => filterFunc(item));
    }
    return query.count();
  }

  private _getGroupItemsQuery(groupId: number) {
    const query = this.createQuery();

    // ie or edge does not support array type index
    return isIEOrEdge
      ? query.filter(item => item.group_ids.includes(groupId))
      : isFirefox
      ? query.contain('group_ids', groupId)
      : query.equal('group_ids', groupId);
  }

  toSanitizedItem(item: Item) {
    return {
      id: item.id,
      group_ids: item.group_ids,
      created_at: item.created_at,
      modified_at: item.modified_at,
    };
  }

  toPartialSanitizedItem(partialItem: Partial<Item>) {
    return {
      ..._.pick(partialItem, ['id', 'created_at', 'group_ids', 'modified_at']),
    };
  }

  shouldSaveSubItem<K extends { id: number; post_ids?: number[] }>(item: K) {
    return !!(item.id > 0 && item.post_ids && item.post_ids.length > 0);
  }

  async update(item: Partial<T>, shouldDoPut = false): Promise<void> {
    await super.update(item, shouldDoPut);
  }

  async bulkUpdate(
    partialItems: Partial<T>[],
    shouldDoPut = false,
  ): Promise<void> {
    return super.bulkUpdate(partialItems, shouldDoPut);
  }
}

export { SubItemDao };
