/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action } from 'mobx';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModelWithData,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { QUERY_DIRECTION } from 'sdk/dao';
import { SortUtils } from 'sdk/framework/utils';
import { ITEM_SORT_KEYS, ItemService, ItemNotification } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { VIEWER_ITEM_TYPE, ViewerItemTypeIdMap } from './constants';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

import { getTypeId, isExpectedItemOfThisGroup, getFilterFunc } from './utils';

class GroupItemDataProvider implements IFetchSortableDataProvider<Item> {
  constructor(
    private _groupId: number,
    private _typeId: number,
    private _sortKey: ITEM_SORT_KEYS,
    private _desc: boolean,
    private _filterFunc: ((value: any, index?: number) => boolean) | undefined,
  ) {}

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModelWithData<Item>,
  ): Promise<{ data: Item[]; hasMore: boolean }> {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const result = await itemService.getItems({
      direction,
      typeId: this._typeId,
      groupId: this._groupId,
      sortKey: this._sortKey,
      desc: this._desc,
      limit: pageSize,
      offsetItemId: anchor && anchor.id,
      filterFunc: this._filterFunc,
    });
    return { data: result, hasMore: result.length === pageSize };
  }
}

type ItemListDataSourceProps = {
  groupId: number;
  type: VIEWER_ITEM_TYPE;
};

class ItemListDataSource {
  @observable groupId: number;
  @observable type: VIEWER_ITEM_TYPE;
  @observable private _sortableDataHandler: FetchSortableDataListHandler<Item>;

  constructor(props: ItemListDataSourceProps) {
    const { groupId, type } = props;
    this.groupId = groupId;
    this.type = type;
    this._buildSortableMemberListHandler(
      this.groupId,
      type,
      ITEM_SORT_KEYS.LATEST_POST_ID,
      false,
    );
  }

  private _transformFunc = (model: Item) =>
    ({
      id: model.id,
      sortValue: FileItemUtils.getLatestPostId(model),
    } as ISortableModelWithData<Item>);

  @action
  private _buildSortableMemberListHandler(
    groupId: number,
    type: number,
    sortKey: ITEM_SORT_KEYS,
    desc: boolean,
  ) {
    const typeId = getTypeId(type);

    const isMatchFunc = (model: Item) =>
      model ? isExpectedItemOfThisGroup(groupId, type, model, false) : false;

    const sortFunc = (
      lhs: ISortableModelWithData<Item>,
      rhs: ISortableModelWithData<Item>,
    ): number => SortUtils.sortModelByKey(lhs, rhs, ['sortValue'], desc);

    const dataProvider = new GroupItemDataProvider(
      groupId,
      typeId,
      sortKey,
      desc,
      getFilterFunc(groupId, type),
    );

    if (this._sortableDataHandler) {
      this._sortableDataHandler.dispose();
    }

    this._sortableDataHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc,
      sortFunc,
      entityName: ENTITY_NAME.ITEM,
      transformFunc: this._transformFunc,
      eventName: ItemNotification.getItemNotificationKey(typeId, groupId),
      hasMoreDown: true,
      hasMoreUp: true,
    });
  }

  getIds() {
    return this._sortableDataHandler.sortableListStore.getIds;
  }

  size() {
    return this._sortableDataHandler.sortableListStore.size;
  }

  hasMore(direction: QUERY_DIRECTION) {
    return this._sortableDataHandler.hasMore(direction);
  }

  get(index: number) {
    return this.getIds()[index];
  }

  @action
  async fetchData(direction: QUERY_DIRECTION, pageSize: number) {
    return await this._sortableDataHandler.fetchData(direction, pageSize);
  }

  @action
  async loadInitialData(itemId: number, pageSize: number) {
    return await this._sortableDataHandler.fetchDataByAnchor(
      QUERY_DIRECTION.BOTH,
      pageSize,
      this._transformFunc({
        id: itemId,
      } as Item),
    );
  }

  @action
  async fetchIndexInfo(itemId: number) {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    return await itemService.getItemIndexInfo(itemId, {
      typeId: ViewerItemTypeIdMap[this.type],
      groupId: this.groupId,
      sortKey: ITEM_SORT_KEYS.LATEST_POST_ID,
      desc: false,
      limit: Infinity,
      offsetItemId: undefined,
      filterFunc: getFilterFunc(this.groupId, this.type),
    });
  }

  dispose() {
    return this._sortableDataHandler.dispose();
  }
}

export { ItemListDataSource, ItemListDataSourceProps };
