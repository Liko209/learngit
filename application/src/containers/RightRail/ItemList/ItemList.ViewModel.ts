/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps, LoadStatus, InitLoadStatus } from './types';
import { QUERY_DIRECTION } from 'sdk/dao';
import { getGlobalValue } from '@/store/utils';
import { t } from 'i18next';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ItemService, ItemUtils, ITEM_SORT_KEYS } from 'sdk/module/item';
import { RIGHT_RAIL_ITEM_TYPE, RightRailItemTypeIdMap } from './constants';
import { SortUtils } from 'sdk/framework/utils';
import { Item } from 'sdk/module/item/entity';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base/fetch';
import { ENTITY } from 'sdk/service';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { GlipTypeUtil } from 'sdk/utils';
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

class ItemListViewModel extends StoreViewModel<Props> implements ViewProps {
  @observable
  private _loadStatus: LoadStatus;
  @observable
  totalCount: number = 0;
  @observable
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
  get tabConfig() {
    return TAB_CONFIG.find(looper => looper.type === this.type)!;
  }

  @computed
  private get _typeId() {
    return RightRailItemTypeIdMap[this.type];
  }

  @computed
  get _active() {
    return this.props.active;
  }

  private _getFilterFunc() {
    switch (this.type) {
      case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
        return ItemUtils.fileFilter(this._groupId, true);
      case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
        return ItemUtils.fileFilter(this._groupId, false);
      case RIGHT_RAIL_ITEM_TYPE.EVENTS:
        return ItemUtils.eventFilter(this._groupId);
      case RIGHT_RAIL_ITEM_TYPE.TASKS:
        return ItemUtils.taskFilter(this._groupId, false);
      default:
        return undefined;
    }
  }

  @computed
  get sort() {
    return (
      this.tabConfig.sort || {
        sortKey: ITEM_SORT_KEYS.CREATE_TIME,
        desc: false,
      }
    );
  }

  constructor(props: Props) {
    super(props);
    this._loadStatus = { ...InitLoadStatus };
    this.reaction(
      () => this._groupId,
      () => {
        this._loadStatus.firstLoaded = false;
        const {
          sortKey = ITEM_SORT_KEYS.CREATE_TIME,
          desc = false,
        } = this.sort;
        this.props.groupId &&
          this._buildSortableMemberListHandler(
            this._groupId,
            this._typeId,
            sortKey,
            desc,
          );
        this.loadTotalCount();
        this.forceReload();
      },
      { fireImmediately: true },
    );
    this.reaction(() => this.ids, () => this.loadTotalCount());
    this.reaction(() => this._active, () => this.forceReload());
  }

  async loadTotalCount() {
    const itemService: ItemService = ItemService.getInstance();
    this.totalCount = await itemService.getGroupItemsCount(
      this._groupId,
      this._typeId,
      this._getFilterFunc(),
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
      this._getFilterFunc(),
    );

    this._sortableDataHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc,
      transformFunc,
      sortFunc,
      entityName: ENTITY_NAME.ITEM,
      eventName: ENTITY.ITEM,
    });
    this.fetchNextPageItems();
  }

  private _isExpectedItemOfThisGroup(item: Item) {
    let isValidItem = !item.deactivated && item.post_ids.length > 0;
    switch (this.type) {
      case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
      case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
      case RIGHT_RAIL_ITEM_TYPE.EVENTS:
      case RIGHT_RAIL_ITEM_TYPE.TASKS:
        isValidItem =
          isValidItem &&
          (this._getFilterFunc() as (valid: Item) => boolean)(item);
      default:
        isValidItem =
          isValidItem &&
          GlipTypeUtil.extractTypeId(item.id) === this._typeId &&
          ItemUtils.isValidItem(this._groupId, item);
    }
    return isValidItem;
  }

  @action
  forceReload = async () => {
    this._loadStatus.firstLoaded = false;
    await this.fetchNextPageItems();
  }

  @action
  fetchNextPageItems = async () => {
    const { active } = this.props;
    const { loading } = this._loadStatus;
    if (!active || loading) {
      return;
    }
    const status = getGlobalValue(GLOBAL_KEYS.NETWORK);
    if (status === 'offline') {
      const { offlinePrompt } = this.tabConfig;
      Notification.flashToast({
        message: t(offlinePrompt),
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
      Object.assign(this._loadStatus, { loadError: true, loading: false });
      return;
    }

    try {
      this._loadStatus.loading = true;
      const result = await this._sortableDataHandler.fetchData(
        QUERY_DIRECTION.NEWER,
      );
      Object.assign(this._loadStatus, { firstLoaded: true, loading: false });
      return result;
    } catch (e) {
      Object.assign(this._loadStatus, { loadError: true, loading: false });
    }
  }

  @computed
  get loadStatus() {
    return this._loadStatus;
  }

  dispose() {
    this._sortableDataHandler.dispose();
  }

  @computed
  get ids() {
    return this._sortableDataHandler.sortableListStore.getIds();
  }
}

export { ItemListViewModel };
