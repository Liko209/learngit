import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { IVirtualListDataSource } from 'jui/pattern/VirtualList';
import { QUERY_DIRECTION } from 'sdk/dao';
import { SortUtils } from 'sdk/framework/utils';
import { ITEM_SORT_KEYS, ItemService, ItemUtils } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { ENTITY } from 'sdk/service';
import { GlipTypeUtil } from 'sdk/utils';

import { RIGHT_RAIL_ITEM_TYPE, RightRailItemTypeIdMap } from './constants';
import { observable, action } from 'mobx';
import { TAB_CONFIG } from './config';

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
  type: RIGHT_RAIL_ITEM_TYPE;
};

class ItemListDataSource implements IVirtualListDataSource<any, number> {
  @observable groupId: number;
  @observable type: RIGHT_RAIL_ITEM_TYPE;
  @observable private _sortableDataHandler: FetchSortableDataListHandler<Item>;
  @observable private _total: number = Infinity;
  @observable private _loadingContent = false;
  @observable private _loadingMoreDown = false;

  constructor(props: ItemListDataSourceProps) {
    const { groupId, type } = props;
    this.groupId = groupId;
    this.setType(type);
  }

  @action
  setType(type: RIGHT_RAIL_ITEM_TYPE) {
    this.type = type;
    const { sortKey, desc } = this._getSort(type);
    this._buildSortableMemberListHandler(this.groupId, type, sortKey, desc);
    this._loadTotalCount(this.groupId, type);
  }

  @action
  private async _loadTotalCount(groupId: number, type: RIGHT_RAIL_ITEM_TYPE) {
    const itemService: ItemService = ItemService.getInstance();
    this._total = await itemService.getGroupItemsCount(
      groupId,
      this._getTypeId(type),
      this._getFilterFunc(groupId, type),
    );
  }

  private _getTabConfig(type: RIGHT_RAIL_ITEM_TYPE) {
    return TAB_CONFIG.find(looper => looper.type === type)!;
  }

  private _getSort(type: RIGHT_RAIL_ITEM_TYPE) {
    return {
      sortKey: ITEM_SORT_KEYS.CREATE_TIME,
      desc: false,
      ...this._getTabConfig(type).sort,
    };
  }

  @action
  private _buildSortableMemberListHandler(
    groupId: number,
    type: number,
    sortKey: ITEM_SORT_KEYS,
    desc: boolean,
  ) {
    const typeId = this._getTypeId(type);

    const isMatchFunc = (model: Item) => {
      return model
        ? this._isExpectedItemOfThisGroup(groupId, type, model)
        : false;
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
      this._getFilterFunc(groupId, type),
    );

    if (this._sortableDataHandler) {
      this._sortableDataHandler.dispose();
    }

    this._sortableDataHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc,
      transformFunc,
      sortFunc,
      entityName: ENTITY_NAME.ITEM,
      eventName: ENTITY.ITEM,
      hasMoreDown: true,
      hasMoreUp: true,
    });
  }

  private _isExpectedItemOfThisGroup(
    groupId: number,
    type: RIGHT_RAIL_ITEM_TYPE,
    item: Item,
  ) {
    let isValidItem = !item.deactivated && item.post_ids.length > 0;
    switch (type) {
      case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
      case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
      case RIGHT_RAIL_ITEM_TYPE.EVENTS:
      case RIGHT_RAIL_ITEM_TYPE.TASKS:
        isValidItem =
          isValidItem &&
          (this._getFilterFunc(groupId, type) as (valid: Item) => boolean)(
            item,
          );
      default:
        isValidItem =
          isValidItem &&
          GlipTypeUtil.extractTypeId(item.id) === this._getTypeId(type) &&
          ItemUtils.isValidItem(groupId, item);
    }
    return isValidItem;
  }

  private _getFilterFunc(groupId: number, type: RIGHT_RAIL_ITEM_TYPE) {
    switch (type) {
      case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
        return ItemUtils.fileFilter(groupId, true);
      case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
        return ItemUtils.fileFilter(groupId, false);
      case RIGHT_RAIL_ITEM_TYPE.EVENTS:
        return ItemUtils.eventFilter(groupId);
      case RIGHT_RAIL_ITEM_TYPE.TASKS:
        return ItemUtils.taskFilter(groupId, false);
      default:
        return undefined;
    }
  }

  private _getTypeId(type: RIGHT_RAIL_ITEM_TYPE) {
    return RightRailItemTypeIdMap[type];
  }

  getIds() {
    return this._sortableDataHandler.sortableListStore.getIds;
  }

  size() {
    return this._sortableDataHandler.sortableListStore.size;
  }

  total() {
    return this._total;
  }

  hasMore() {
    return this._sortableDataHandler.hasMore(QUERY_DIRECTION.NEWER);
  }

  isLoadingContent() {
    return this._loadingContent;
  }

  isLoadingMore(direction: 'up' | 'down') {
    if ('down' === direction) {
      return this._loadingMoreDown;
    }
    return false;
  }

  isLoading() {
    return (
      this.isLoadingContent() ||
      this.isLoadingMore('up') ||
      this.isLoadingMore('down')
    );
  }

  get(index: number) {
    return this.getIds()[index];
  }

  @action
  async loadMore(startIndex: number, stopIndex: number) {
    this._loadingMoreDown = true;
    await this._sortableDataHandler.fetchData(
      QUERY_DIRECTION.NEWER,
      stopIndex - startIndex + 1,
    );
    this._loadingMoreDown = false;
  }

  @action
  async loadInitialData() {
    this._loadingContent = true;
    await this._sortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
    this._loadingContent = false;
  }

  dispose() {
    return this._sortableDataHandler.dispose();
  }
}

export { ItemListDataSource };
