/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action } from 'mobx';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { QUERY_DIRECTION } from 'sdk/dao';
import { SortUtils } from 'sdk/framework/utils';
import {
  ITEM_SORT_KEYS,
  ItemService,
  ItemUtils,
  ItemNotification,
} from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { GlipTypeUtil } from 'sdk/utils';
import { VIEWER_ITEM_TYPE, ViewerItemTypeIdMap } from './constants';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';

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
    anchor?: ISortableModel<Item>,
  ): Promise<{ data: Item[]; hasMore: boolean }> {
    const itemService: ItemService = ItemService.getInstance();
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
      ITEM_SORT_KEYS.LATEST_VERSION_DATE,
      false,
    );
  }

  private _transformFunc = (model: Item) => {
    return {
      id: model.id,
      sortValue: FileItemUtils.getVersionDate(model) || model.created_at,
    } as ISortableModel<Item>;
  }

  @action
  private _buildSortableMemberListHandler(
    groupId: number,
    type: number,
    sortKey: ITEM_SORT_KEYS,
    desc: boolean,
  ) {
    const typeId = this.getTypeId(type);

    const isMatchFunc = (model: Item) => {
      return model
        ? this.isExpectedItemOfThisGroup(groupId, type, model, false)
        : false;
    };

    const sortFunc = (
      lhs: ISortableModel<Item>,
      rhs: ISortableModel<Item>,
    ): number => {
      return SortUtils.sortModelByKey(lhs, rhs, ['sortValue'], desc);
    };

    const dataProvider = new GroupItemDataProvider(
      groupId,
      typeId,
      sortKey,
      desc,
      this.getFilterFunc(groupId, type),
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

  isExpectedItemOfThisGroup(
    groupId: number,
    type: VIEWER_ITEM_TYPE,
    item: Item,
    includeDeactivated: boolean,
  ) {
    let isValidItem = item.post_ids.length > 0;
    if (!includeDeactivated) {
      isValidItem = !item.deactivated;
    }
    switch (type) {
      case VIEWER_ITEM_TYPE.IMAGE_FILES:
        isValidItem =
          isValidItem &&
          (this.getFilterFunc(groupId, type) as (valid: Item) => boolean)(
            item,
          ) &&
          GlipTypeUtil.extractTypeId(item.id) === this.getTypeId(type) &&
          ItemUtils.isValidItem(groupId, item);
        break;
      default:
        isValidItem =
          isValidItem &&
          GlipTypeUtil.extractTypeId(item.id) === this.getTypeId(type) &&
          ItemUtils.isValidItem(groupId, item);
    }
    return isValidItem;
  }

  getFilterFunc(groupId: number, type: VIEWER_ITEM_TYPE) {
    switch (type) {
      case VIEWER_ITEM_TYPE.IMAGE_FILES:
        return (file: Item) => {
          return (
            ItemUtils.fileFilter(groupId, true)(file) &&
            FileItemUtils.isSupportPreview(file)
          );
        };
      default:
        return undefined;
    }
  }

  getTypeId(type: VIEWER_ITEM_TYPE) {
    return ViewerItemTypeIdMap[type];
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

  dispose() {
    return this._sortableDataHandler.dispose();
  }
}

export { ItemListDataSource, ItemListDataSourceProps };
