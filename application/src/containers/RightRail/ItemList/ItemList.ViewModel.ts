/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
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
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { ITEM_LIST_TYPE } from '../types';

const ItemTypeIdMap = {
  [ITEM_LIST_TYPE.FILE]: TypeDictionary.TYPE_ID_FILE,
};

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

class ItemListViewModel extends StoreViewModel<Props> implements ViewProps {
  @observable
  totalCount: number;
  @observable
  private _sortKey: ITEM_SORT_KEYS;
  @observable
  private _desc: boolean = false;
  private _sortableDataHandler: FetchSortableDataListHandler<Item>;
  @computed
  private get _groupId() {
    return this.props.groupId;
  }
  @computed
  get type() {
    return this.props.type;
  }

  @computed
  private get _typeId() {
    return ItemTypeIdMap[this.type];
  }

  constructor() {
    super();
    this._buildSortableMemberListHandler(
      this._groupId,
      this._typeId,
      this._sortKey,
      this._desc,
    );
    this.loadTotalCount();
  }

  async loadTotalCount() {
    const itemService: ItemService = ItemService.getInstance();
    this.totalCount = await itemService.getGroupItemsCount(
      this._groupId,
      this._typeId,
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

  @action
  fetchNextPageItems() {
    return this._sortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
  }

  @computed
  ids() {
    return this._sortableDataHandler.sortableListStore.getIds();
  }
}

export { ItemListViewModel };
