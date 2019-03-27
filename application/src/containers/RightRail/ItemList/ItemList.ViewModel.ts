import { observable, action, computed } from 'mobx';
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
import { StoreViewModel } from '@/store/ViewModel';
import { RIGHT_RAIL_ITEM_TYPE, RightRailItemTypeIdMap } from './constants';
import { TAB_CONFIG } from './config';
import { Props } from './types';

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

class ItemListViewModel extends StoreViewModel<Props> {
  @observable private _sortableDataHandler: FetchSortableDataListHandler<Item>;
  @observable private _total: number = Infinity;
  @observable private _loadingContent = false;
  @observable private _loadingMoreDown = false;

  constructor(props: Props) {
    super(props);
    this.reaction(
      () => this._groupID,
      () => {
        this.setType(this._type);
        this._loadTotalCount();
        this.loadInitialData();
      },
      { fireImmediately: true },
    );

    this.reaction(() => this.getIds.length, () => this._loadTotalCount(), {
      fireImmediately: true,
    });
  }

  @computed
  get _type() {
    return this.props.type;
  }

  @computed
  get _groupID() {
    return this.props.groupId;
  }

  @computed
  get _active() {
    return this.props.active;
  }

  @action
  setType = (type: RIGHT_RAIL_ITEM_TYPE) => {
    const { sortKey, desc } = this.getSort();
    this._buildSortableMemberListHandler(
      this.props.groupId,
      type,
      sortKey,
      desc,
    );
  }

  @action
  private _loadTotalCount = async () => {
    const itemService: ItemService = ItemService.getInstance();
    this._total = await itemService.getGroupItemsCount(
      this.props.groupId,
      this._getTypeId(this._type),
      this._getFilterFunc(this.props.groupId, this._type),
    );
  }

  private _getTabConfig(type: RIGHT_RAIL_ITEM_TYPE) {
    return TAB_CONFIG.find(looper => looper.type === type)!;
  }

  getSort() {
    return {
      sortKey: ITEM_SORT_KEYS.CREATE_TIME,
      desc: false,
      ...this._getTabConfig(this._type).sort,
    };
  }

  @action
  private _buildSortableMemberListHandler = async (
    groupId: number,
    type: number,
    sortKey: ITEM_SORT_KEYS,
    desc: boolean,
  ) => {
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
      eventName: ItemNotification.getItemNotificationKey(typeId, groupId),
      hasMoreDown: true,
      hasMoreUp: false,
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
        break;
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

  @computed
  get dataSource() {
    return this;
  }

  @computed
  get getIds() {
    return this._sortableDataHandler.sortableListStore.getIds;
  }

  size() {
    return this._sortableDataHandler.sortableListStore.size;
  }

  total() {
    return this._total;
  }

  hasMore = () => {
    return this._sortableDataHandler.hasMore(QUERY_DIRECTION.NEWER);
  }

  isLoadingContent = () => {
    return this._loadingContent;
  }

  isLoadingMore = (direction: 'up' | 'down') => {
    if ('down' === direction) {
      return this._loadingMoreDown;
    }
    return false;
  }

  isLoading = () => {
    return (
      this.isLoadingContent() ||
      this.isLoadingMore('up') ||
      this.isLoadingMore('down')
    );
  }

  get = (index: number) => {
    return this.getIds[index];
  }

  @action
  loadMore = async (startIndex: number, stopIndex: number) => {
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

export { ItemListViewModel };
