/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ITEM_SORT_KEYS, ItemService, ItemNotification } from 'sdk/module/item';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { EVENT_TYPES, notificationCenter, ENTITY } from 'sdk/service';
import {
  NotificationEntityPayload,
  NotificationEntityUpdatePayload,
  NotificationEntityDeletePayload,
} from 'sdk/service/notificationCenter';

import { AbstractViewModel } from '@/base';

import { VIEWER_ITEM_TYPE, ViewerItemTypeIdMap } from './constants';
import { ViewerViewProps } from './types';
import { ItemListDataSource } from './Viewer.DataSource';
import { Group } from 'sdk/module/group';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import portalManager from '@/common/PortalManager';

const INIT_PAGE_SIZE = 5;

class ViewerViewModel extends AbstractViewModel<ViewerViewProps> {
  @observable
  currentIndex: number = 0;
  @observable
  currentItemId: number;
  private _itemListDataSource: ItemListDataSource;
  private _onCurrentItemDeletedCb: () => void;

  @observable
  total: number = 0;

  constructor(props: ViewerViewProps) {
    super(props);
    const { groupId, type, itemId } = props;
    this.currentItemId = itemId;
    this._itemListDataSource = new ItemListDataSource({ groupId, type });
    const itemNotificationKey = ItemNotification.getItemNotificationKey(
      ViewerItemTypeIdMap[this.props.type],
      groupId,
    );
    notificationCenter.on(itemNotificationKey, this._onItemDataChange);
    notificationCenter.on(ENTITY.GROUP, this._onGroupDataChange);
  }

  @action
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
    notificationCenter.off(ENTITY.GROUP, this._onGroupDataChange);
    this._itemListDataSource.dispose();
  }

  @computed
  get ids() {
    return this._itemListDataSource.getIds();
  }

  @action
  updateCurrentItemIndex = (index: number, itemId: number) => {
    this.currentIndex = index;
    this.currentItemId = itemId;
  }

  getCurrentItemId = () => {
    return this.currentItemId;
  }

  getCurrentIndex = () => {
    return this.currentIndex;
  }

  @action
  _updateCurrentItemIndex = (index: number, itemId: number) => {
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
      this.currentIndex = info.index;
      if (info.index < 0) {
        this._onCurrentItemDeletedCb && this._onCurrentItemDeletedCb();
      }
    }
  }

  private _onExceptions(toastMessage: string) {
    portalManager.dismissAll();
    Notification.flashToast({
      message: toastMessage,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  private _onItemDataChange = (
    payload: NotificationEntityPayload<FileItem>,
  ) => {
    const { type } = payload;
    const { groupId } = this.props;
    if (type === EVENT_TYPES.DELETE) {
      (payload as NotificationEntityDeletePayload).body.ids.forEach(
        (id: number) => {
          if (id === this.currentItemId) {
            this._onExceptions('viewer.ImageDeleted');
          }
        },
      );
      return;
    }
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

  private _onGroupDataChange = (payload: NotificationEntityPayload<Group>) => {
    const { type } = payload;
    const { groupId } = this.props;
    if (type === EVENT_TYPES.DELETE) {
      (payload as NotificationEntityDeletePayload).body.ids.forEach(
        (id: number) => {
          if (id === groupId) {
            this._onExceptions('viewer.TeamDeleted');
          }
        },
      );
    }

    if (type === EVENT_TYPES.UPDATE) {
      (payload as NotificationEntityUpdatePayload<Group>).body.ids.forEach(
        (id: number) => {
          if (id === groupId) {
            this._onExceptions('viewer.TeamArchived');
          }
        },
      );
    }
  }
}

export { ViewerViewModel };
