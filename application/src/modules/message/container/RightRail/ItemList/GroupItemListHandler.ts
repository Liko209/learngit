/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-24 15:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import {
  FetchSortableDataListHandler,
  IFetchSortableDataListHandlerOptions,
  ISortableModelWithData,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { action, computed, observable, reaction } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { SortUtils } from 'sdk/framework/utils';
import { ItemNotification, ItemService } from 'sdk/module/item';
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
import { GroupItemDataProvider } from './GroupItemDataProvider';

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

    const isMatchFunc = (model?: Item) =>
      model ? isExpectedItemOfThisGroup(groupId, type, model) : false;

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
      } as ISortableModelWithData<Item>;
    };

    const sortFunc = (
      lhs: ISortableModelWithData<Item>,
      rhs: ISortableModelWithData<Item>,
    ): number =>
      SortUtils.sortModelByKey(
        lhs.data as Item,
        rhs.data as Item,
        [sortKey],
        desc,
      );

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

  async fetchData(direction: QUERY_DIRECTION, pageSize?: number) {
    const size = pageSize ? pageSize : this._pageSize;
    const anchor =
      direction === QUERY_DIRECTION.OLDER ? this.getOldest() : this.getNewest();
    return this.fetchDataInternal(direction, size, anchor);
  }

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
