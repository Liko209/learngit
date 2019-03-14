/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ITEM_SORT_KEYS, ItemService, ItemNotification } from 'sdk/module/item';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { EVENT_TYPES, notificationCenter } from 'sdk/service';
import {
  NotificationEntityPayload,
  NotificationEntityUpdatePayload,
} from 'sdk/service/notificationCenter';

import { AbstractViewModel } from '@/base';

import { VIEWER_ITEM_TYPE, ViewerItemTypeIdMap } from './constants';
import { ViewerViewProps } from './types';
import { ItemListDataSource } from './Viewer.DataSource';

const INIT_PAGE_SIZE = 5;

class ViewerViewModel extends AbstractViewModel<ViewerViewProps> {
  @observable
  private _currentIndex?: number;
  @observable
  private _currentItemId?: number;
  private _itemListDataSource: ItemListDataSource;
  private _onCurrentItemDeletedCb: () => void;

  @observable
  total: number = 0;

  constructor(props: ViewerViewProps) {
    super(props);
    const { groupId, type, itemId } = props;
    this._currentItemId = itemId;
    this._itemListDataSource = new ItemListDataSource({ groupId, type });

    const itemNotificationKey = ItemNotification.getItemNotificationKey(
      ViewerItemTypeIdMap[this.props.type],
      groupId,
    );
    notificationCenter.on(itemNotificationKey, this._onItemDataChange);
  }

  init = () => {
    this._itemListDataSource.loadInitialData(this.props.itemId, INIT_PAGE_SIZE);
    this._fetchIndexInfo();
  }

  dispose() {
    const itemNotificationKey = ItemNotification.getItemNotificationKey(
      ViewerItemTypeIdMap[this.props.type],
      this.props.groupId,
    );
    notificationCenter.off(itemNotificationKey, this._onItemDataChange);
    this._itemListDataSource.dispose();
  }

  @computed
  get currentItemId() {
    return this._currentItemId === undefined
      ? this.props.itemId
      : this._currentItemId;
  }

  set currentItemId(index: number) {
    this._currentItemId = index;
  }

  @computed
  get currentIndex() {
    return this._currentIndex || 0;
  }

  set currentIndex(index: number) {
    this._currentIndex = index;
  }

  @computed
  get ids() {
    return this._itemListDataSource.getIds();
  }

  updateCurrentItemIndex = (index: number, itemId: number) => {
    this.currentIndex = index;
    this.currentItemId = itemId;
  }

  fetchData = async (direction: QUERY_DIRECTION, pageSize: number) => {
    return await this._itemListDataSource.fetchData(direction, pageSize);
  }

  setOnCurrentItemDeletedCb = (callback: () => void) => {
    this._onCurrentItemDeletedCb = callback;
  }

  private _fetchIndexInfo = async () => {
    const itemId = this.currentItemId;
    const info = await (ItemService.getInstance() as ItemService).getItemIndexInfo(
      itemId,
      {
        typeId: ViewerItemTypeIdMap[this.props.type],
        groupId: this.props.groupId,
        sortKey: ITEM_SORT_KEYS.MODIFIED_TIME,
        desc: false,
        limit: Infinity,
        offsetItemId: undefined,
        filterFunc: this._itemListDataSource.getFilterFunc(
          this.props.groupId,
          this.props.type,
        ),
      },
    );
    this.total = info.totalCount;
    if (this.currentItemId === itemId) {
      this._currentIndex = info.index;
      if (info.index < 0) {
        this._onCurrentItemDeletedCb && this._onCurrentItemDeletedCb();
      }
    }
  }

  private _onItemDataChange = (
    payload: NotificationEntityPayload<FileItem>,
  ) => {
    const { type } = payload;
    const { groupId } = this.props;
    let needRefreshIndex = false;
    if (type === EVENT_TYPES.UPDATE) {
      const detailPayload = payload as NotificationEntityUpdatePayload<
        FileItem
      >;
      detailPayload.body.entities.forEach((entity, key) => {
        if (
          this._itemListDataSource.isExpectedItemOfThisGroup(
            groupId,
            VIEWER_ITEM_TYPE.IMAGE_FILES,
            entity,
            true,
          )
        ) {
          needRefreshIndex = true;
        }
      });
    }
    if (needRefreshIndex) {
      this._fetchIndexInfo();
    }
  }
}

export { ViewerViewModel };
