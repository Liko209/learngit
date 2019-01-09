// /*
//  * @Author: Thomas thomas.yang@ringcentral.com
//  * @Date: 2019-01-08 17:25:50
//  * Copyright © RingCentral. All rights reserved.
//  */

import { QUERY_DIRECTION } from 'sdk/dao';
import { ItemService, ITEM_SORT_KEYS, SortUtils } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base/fetch';
import { ENTITY } from 'sdk/service';
import { ENTITY_NAME } from '@/store/constants';
import { GlipTypeUtil } from 'sdk/utils';

class GroupItemDataProvider implements IFetchSortableDataProvider<Item> {
  constructor(
    private _groupId: number,
    private _typeId: number,
    private _sortKey: ITEM_SORT_KEYS,
    private _desc: boolean,
  ) {}

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<Item>,
  ): Promise<{ data: Item[]; hasMore: boolean }> {
    const itemService: ItemService = ItemService.getInstance();
    const result = await itemService.getItems(
      this._typeId,
      this._groupId,
      pageSize,
      anchor ? anchor.id : 0,
      this._sortKey,
      this._desc,
    );

    return { data: result, hasMore: result.length === pageSize };
  }
}

class GroupItemListHandler {
  private _sortableDataHandler: FetchSortableDataListHandler<Item>;

  constructor(
    private _groupId: number,
    private _typeId: number,
    sortKey: ITEM_SORT_KEYS,
    desc: boolean,
  ) {
    this._buildSortableMemberListHandler(
      this._groupId,
      this._typeId,
      sortKey,
      desc,
    );
  }

  private _buildSortableMemberListHandler(
    groupId: number,
    typeId: number,
    sortKey: ITEM_SORT_KEYS,
    desc: boolean,
  ) {
    const isMatchFunc = (model: Item) => {
      return model ? this._isExpectedItemOfThisGroup(model) : false;
    };

    const transformFunc = (model: Item) => {
      return {
        id: model.id,
        sortValue: model.id,
        data: model,
      } as ISortableModel<Item>;
    };

    const sortFunc = (
      lhs: ISortableModel<Item>,
      rhs: ISortableModel<Item>,
    ): number => {
      return SortUtils.sortModelByKey(
        lhs.data as Item,
        rhs.data as Item,
        sortKey,
        desc,
      );
    };

    const dataProvider = new GroupItemDataProvider(
      groupId,
      typeId,
      sortKey,
      desc,
    );

    this._sortableDataHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc,
      transformFunc,
      sortFunc,
      entityName: ENTITY_NAME.ITEM,
      eventName: ENTITY.ITEM,
    });
    this._sortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
  }

  private _isExpectedItemOfThisGroup(item: Item) {
    return (
      item.id > 0 &&
      !item.deactivated &&
      GlipTypeUtil.extractTypeId(item.id) === this._typeId &&
      item.group_ids.includes(this._groupId) &&
      item.post_ids.length > 0
    );
  }

  fetchNextPageItems() {
    return this._sortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
  }

  getItemIds() {
    return this._sortableDataHandler.sortableListStore.getIds();
  }

  async totalCount() {
    const itemService: ItemService = ItemService.getInstance();
    return itemService.getGroupItemsCount(this._groupId, this._typeId);
  }
}

export { GroupItemListHandler };
