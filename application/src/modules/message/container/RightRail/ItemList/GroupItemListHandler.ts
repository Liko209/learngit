/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-24 15:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import {
  FetchSortableDataListHandler,
  IFetchSortableDataListHandlerOptions,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { action, computed, observable, reaction } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { SortUtils } from 'sdk/framework/utils';
import { ItemNotification, ItemService, ITEM_SORT_KEYS } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { IGroupItemListHandler } from './types';
import {
  getSort,
  getTypeId,
  isExpectedItemOfThisGroup,
  getFilterFunc,
} from './utils';

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
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const result = await itemService.getItems({
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

// TODO Can be refactored using polymorphism and strategy pattern
class GroupItemListHandler extends FetchSortableDataListHandler<Item>
  implements IGroupItemListHandler {
  private _groupId: number;
  private _type: RIGHT_RAIL_ITEM_TYPE;
  private _disposers: any[];
  @observable private _total: number;

  @computed
  get total() {
    return this._total;
  }

  constructor(
    groupId: number,
    type: RIGHT_RAIL_ITEM_TYPE,
    options?: IFetchSortableDataListHandlerOptions<Item>,
  ) {
    const { sortKey, desc } = getSort(type);
    const typeId = getTypeId(type);

    const isMatchFunc = (model: Item) => {
      return model ? isExpectedItemOfThisGroup(groupId, type, model) : false;
    };

    const transformFunc = (model: Item) => {
      const data = { id: model.id };
      if (
        type === RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES ||
        type === RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES
      ) {
        data[sortKey] = FileItemUtils.getLatestPostId(model);
      } else {
        data[sortKey] = model[sortKey];
      }

      return {
        data,
        id: model.id,
        sortValue: model.id,
      } as ISortableModel<Item>;
    };

    const sortFunc = (
      lhs: ISortableModel<Item>,
      rhs: ISortableModel<Item>,
    ): number => {
      return SortUtils.sortModelByKey(
        lhs.data as Item,
        rhs.data as Item,
        [sortKey],
        desc,
      );
    };

    const dataProvider = new GroupItemDataProvider(
      groupId,
      typeId,
      sortKey,
      desc,
      getFilterFunc(groupId, type),
    );

    super(dataProvider, {
      isMatchFunc,
      transformFunc,
      sortFunc,
      entityName: ENTITY_NAME.ITEM,
      eventName: ItemNotification.getItemNotificationKey(typeId, groupId),
      hasMoreDown: true,
      hasMoreUp: true,
      ...options,
    });
    this._groupId = groupId;
    this._type = type;
    this._total = Infinity;

    this._loadTotalCount();

    const disposer = reaction(
      () => this.sortableListStore.getIds.length,
      () => this._loadTotalCount(),
      {
        fireImmediately: true,
      },
    );

    this._disposers = [disposer];
  }

  getOldest() {
    return this.sortableListStore.first();
  }

  getNewest() {
    return this.sortableListStore.last();
  }

  async fetchData(direction: QUERY_DIRECTION, pageSize?: number) {
    const size = pageSize ? pageSize : this._pageSize;
    const anchor =
      direction === QUERY_DIRECTION.OLDER ? this.getOldest() : this.getNewest();
    return this.fetchDataInternal(direction, size, anchor);
  }

  @action
  hasMore(direction: QUERY_DIRECTION) {
    if (direction === QUERY_DIRECTION.NEWER) {
      return false;
    }
    return this.sortableListStore.size < this.total;
  }

  @action
  private async _loadTotalCount() {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    this._total = await itemService.getGroupItemsCount(
      this._groupId,
      getTypeId(this._type),
      getFilterFunc(this._groupId, this._type),
    );
  }

  dispose() {
    super.dispose();
    this._disposers.forEach(disposer => disposer());
  }
}

export { GroupItemListHandler };
