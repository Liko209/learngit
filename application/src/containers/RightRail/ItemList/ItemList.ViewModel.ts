/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ItemService, ItemUtils, ITEM_SORT_KEYS } from 'sdk/module/item';
import { RIGHT_RAIL_ITEM_TYPE, RightRailItemTypeIdMap } from './constants';
import { SortUtils } from 'sdk/framework/utils';
import { getGlobalValue } from '@/store/utils';
import { Item } from 'sdk/module/item/entity';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { t } from 'i18next';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base/fetch';
import { ENTITY } from 'sdk/service';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { GlipTypeUtil } from 'sdk/utils';
import { TAB_CONFIG } from './config';

// async function delay(time: number) {
//   return new Promise((resolve: Function) => {
//     setTimeout(resolve, time);
//   });
// }

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
  private _firstLoaded: boolean = false;
  @observable
  private _loadError: boolean = false;
  @observable
  totalCount: number = 0;
  @observable
  private _sortKey: ITEM_SORT_KEYS = ITEM_SORT_KEYS.CREATE_TIME;
  @observable
  private _desc: boolean = true;
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
    return TAB_CONFIG.find(looper => looper.type === this.props.type)!;
  }

  @computed
  private get _typeId() {
    return RightRailItemTypeIdMap[this.type];
  }

  private _getFilterFunc() {
    switch (this.type) {
      case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
        return ItemUtils.fileFilter(this._groupId, true);
      case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
        return ItemUtils.fileFilter(this._groupId, false);
      default:
        return undefined;
    }
  }

  constructor(props: Props) {
    super(props);
    this.reaction(() => this.props.type, () => (this._firstLoaded = false));
    this.reaction(
      () => this.props.groupId,
      () => {
        this._firstLoaded = false;
        this.props.groupId &&
          this._buildSortableMemberListHandler(
            this._groupId,
            this._typeId,
            this._sortKey,
            this._desc,
          );
        this.loadTotalCount();
      },
      { fireImmediately: true },
    );
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
  }

  private _isExpectedItemOfThisGroup(item: Item) {
    let isValidItem =
      item.id > 0 &&
      !item.deactivated &&
      GlipTypeUtil.extractTypeId(item.id) === this._typeId &&
      item.group_ids.includes(this._groupId) &&
      item.post_ids.length > 0;
    switch (this.type) {
      case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
      case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
        isValidItem =
          isValidItem &&
          (this._getFilterFunc() as (valid: Item) => boolean)(item);
      default:
    }
    return isValidItem;
  }

  @action
  fetchNextPageItems = async () => {
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
      return;
    }

    try {
      const result = await this._sortableDataHandler.fetchData(
        QUERY_DIRECTION.NEWER,
      );
      this._firstLoaded = true;
      return result;
    } catch (e) {
      //
      this._loadError = true;
    }
  }

  @computed
  get loadError() {
    return this._loadError;
  }

  @computed
  get firstLoaded() {
    return this._firstLoaded;
  }

  @computed
  get ids() {
    return this._sortableDataHandler.sortableListStore.getIds();
  }
}

export { ItemListViewModel };
