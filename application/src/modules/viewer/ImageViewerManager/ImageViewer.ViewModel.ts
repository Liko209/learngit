/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action, transaction } from 'mobx';
import moment from 'moment';
import { PreloadController } from '@/modules/viewer/container/Viewer/Preload';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ItemNotification } from 'sdk/module/item';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { EVENT_TYPES, notificationCenter } from 'sdk/service';
import {
  NotificationEntityPayload,
  NotificationEntityUpdatePayload,
  NotificationEntityDeletePayload,
} from 'sdk/service/notificationCenter';
import { AbstractViewModel } from '@/base';
import { VIEWER_ITEM_TYPE, ViewerItemTypeIdMap } from './constants';
import { ItemListDataSource } from './Viewer.DataSource';

import { ItemListDataSourceByPost } from './Viewer.DataSourceByPost';
import { mainLogger } from 'sdk';
import { Group } from 'sdk/module/group';
import { Profile } from 'sdk/module/profile/entity';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import portalManager from '@/common/PortalManager';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { getEntity, getSingleEntity } from '@/store/utils';
import ProfileModel from '@/store/models/Profile';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import FileItemModel from '@/store/models/FileItem';
import { Item } from 'sdk/module/item/entity';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { getLargeRawImageURL } from '@/common/getThumbnailURL';
import { dateFormatter } from '@/utils/date';
import {
  IViewerView,
} from '@/modules/viewer/container/ViewerView/interface';
import { isExpectedItemOfThisGroup, getNextItemToDisplay } from './utils';
import { ImageViewerViewModuleProps } from './type';

const PAGE_SIZE = 20;

class ImageViewerViewModel extends AbstractViewModel<ImageViewerViewModuleProps> implements IViewerView  {
  @observable _sender: PersonModel | null;
  @observable _createdAt: number | null;
  @observable private _largeRawImageURL?: string;
  @observable thumbnailSrc?: string;
  @observable originElement?: HTMLElement;
  @observable
  isLoadingMore: boolean = false;
  @observable
  currentIndex: number = -1;
  @observable
  currentItemId: number;
  private _itemListDataSource: ItemListDataSource | ItemListDataSourceByPost;
  private _onCurrentItemDeletedCb: (nextItemId: number) => void;
  private _onItemSwitchCb: (
    itemId: number,
    index: number,
    type: 'previous' | 'next',
  ) => void;

  @observable
  total: number = -1;

  historyIds: number[] | null = null;

  toBeDeletedItem: Set<number> = new Set();

  private _preloadController: PreloadController;

  constructor(props: ImageViewerViewModuleProps) {
    super(props);
    const { groupId, type, itemId, postId, isNavigation, initialOptions } = props;

    this._sender = null;
    this._createdAt = null;

    this.thumbnailSrc = initialOptions.thumbnailSrc;
    this.originElement = initialOptions.originElement;
    this.currentItemId = itemId;
    this._itemListDataSource = isNavigation
      ? new ItemListDataSourceByPost({ groupId, type, postId })
      : new ItemListDataSource({
          groupId,
          type,
        });
    this._preloadController = new PreloadController();

    const itemNotificationKey = ItemNotification.getItemNotificationKey(
      ViewerItemTypeIdMap[props.type],
      groupId,
    );
    notificationCenter.on(itemNotificationKey, this._onItemDataChange);

    this.reaction(
      () => this.currentItemId,
      async () => {
        this._preloadController.setIsAllowed(false);
      },
    );

    this.reaction(
      () => ({ itemId: this.currentItemId, ids: this.ids }),
      async () => {
        this.doPreload();
      },
    );

    this.reaction(
      () =>
        getSingleEntity<Profile, ProfileModel>(
          ENTITY_NAME.PROFILE,
          'hiddenGroupIds',
        ),
      (hiddenGroupIds: number[]) => {
        if (hiddenGroupIds.includes(groupId)) {
          this._onExceptions('viewer.ConversationClosed');
        }
      },
      {
        equals: (a: number[], b: number[]) =>
          a.sort().toString() === b.sort().toString(),
      },
    );
    this.reaction(
      () => this.group.isArchived,
      (isArchived: boolean) => {
        if (isArchived) {
          this._onExceptions('viewer.TeamArchived');
        }
      },
    );
    this.reaction(
      () => this.group.deactivated,
      (deactivated: boolean) => {
        if (deactivated) {
          this._onExceptions('viewer.TeamDeleted');
        }
      },
    );

    this.reaction(
      () => this.ids,
      ids => {
        if (this.historyIds === null || this.historyIds.length === 0) {
          this.historyIds = ids;
        }
      },
    );
    this.reaction(
      () => {
        const item = this._item;
        return item ? item.id : 0;
      },
      async () => {
        this._largeRawImageURL = await getLargeRawImageURL(this._item);
      },
      { fireImmediately: true },
    );

    this.autorun(this.updateSenderInfo);
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.groupId);
  }

  @action
  init = () => {
    const { itemId } = this.props;
    this._itemListDataSource.loadInitialData(itemId, PAGE_SIZE);
    this._updateIndexInfo();
  };

  doPreload = () => {
    if (this.ids) {
      this._preloadController.replacePreload(this.ids, this._getItemIndex());
    }
  };

  stopPreload = () => {
    this._preloadController.stop();
  };

  onContentLoad = () => {
    this.enablePreload();
  };

  onContentError = () => {
    this.enablePreload();
  };

  enablePreload = () => {
    setTimeout(() => {
      this._preloadController.setIsAllowed(true);
    });
  };

  dispose() {
    super.dispose();
    const itemNotificationKey = ItemNotification.getItemNotificationKey(
      ViewerItemTypeIdMap[this.props.type],
      this.props.groupId,
    );
    notificationCenter.off(itemNotificationKey, this._onItemDataChange);
    this._itemListDataSource.dispose();
  }

  @computed
  get ids() {
    return this._itemListDataSource.getIds();
  }

  @action
  updateCurrentItemIndex = (index: number, itemId: number) => {
    transaction(() => {
      this.currentIndex = index;
      this.currentItemId = itemId;
    });
  };

  getCurrentItemId = () => this.currentItemId;

  getCurrentIndex = () => this.currentIndex;

  setOnCurrentItemDeletedCb = (callback: (nextItemId: number) => void) => {
    this._onCurrentItemDeletedCb = callback;
  };

  setOnItemSwitchCb = (callback: (itemId: number) => void) => {
    this._onItemSwitchCb = callback;
  };

  @computed
  get hasPrevious() {
    return this.currentIndex > 0;
  }

  @computed
  get hasNext() {
    return this.currentIndex < this.total - 1;
  }

  viewerDestroyer() {
    this.props.dismiss();
  }

  @action
  switchToPrevious = () => {
    if (this.ids.length < 2 || this.ids[0] === this.currentItemId) {
      if (this.hasPrevious) {
        this.loadMore(QUERY_DIRECTION.OLDER).then((result: FileItem[]) => {
          result && this.switchToPrevious();
        });
      } else {
        // should not come here
        mainLogger.warn('can not switchPreImage', {
          ids: this.ids,
          currentItemId: this.currentItemId,
        });
      }
    } else {
      const itemId = this.ids[this._getItemIndex() - 1];
      const index = this.currentIndex - 1;
      itemId && this.updateCurrentItemIndex(index, itemId);
      itemId &&
        this._onItemSwitchCb &&
        this._onItemSwitchCb(itemId, index, 'previous');
    }
  };

  @action
  switchToNext = () => {
    if (
      this.ids.length < 2 ||
      this.ids[this.ids.length - 1] === this.currentItemId
    ) {
      if (this.hasNext) {
        this.loadMore(QUERY_DIRECTION.NEWER).then((result: FileItem[]) => {
          result && this.switchToNext();
        });
      } else {
        // should not come here
        mainLogger.warn('can not switchNextImage', {
          ids: this.ids,
          currentItemId: this.currentItemId,
        });
      }
    } else {
      const itemId = this.ids[this._getItemIndex() + 1];
      const index = this.currentIndex + 1;
      itemId && this.updateCurrentItemIndex(index, itemId);
      itemId &&
        this._onItemSwitchCb &&
        this._onItemSwitchCb(itemId, index, 'next');
    }
  };

  loadMore = async (direction: QUERY_DIRECTION): Promise<FileItem[] | null> => {
    if (this.isLoadingMore) {
      return null;
    }
    this.isLoadingMore = true;
    const result = await this._itemListDataSource.fetchData(
      direction,
      PAGE_SIZE,
    );
    this.isLoadingMore = false;
    return result;
  };

  private _getItemIndex = (): number =>
    this.ids.findIndex((_id: number) => _id === this.currentItemId);

  private _updateIndexInfo = async () => {
    const itemId = this.currentItemId;
    const info = await this._itemListDataSource.fetchIndexInfo(itemId);
    console.log('xxx', {itemId, info})
    transaction(() => {
      this.total = info.totalCount;
      if (this.currentItemId === itemId) {
        const itemDeleted = info.index < 0;
        if (itemDeleted) {
          const itemType = this._itemListDataSource.type;
          const groupId = this._itemListDataSource.groupId;

          mainLogger
            .tags('ImageViewer')
            .info(
              `Item no exist. itemId: ${itemId}, itemType: ${itemType}, groupId: ${groupId}, info: ${
                info.index
              }/${info.totalCount}`,
            );

          const nextToDisplay = getNextItemToDisplay(
            this.historyIds!,
            this.ids,
            this.currentItemId,
            this.currentIndex,
          );

          this.updateCurrentItemIndex(
            nextToDisplay.index,
            nextToDisplay.itemId,
          );
          this._onCurrentItemDeletedCb &&
            this._onCurrentItemDeletedCb(nextToDisplay.itemId);
        } else {
          this.currentIndex = info.index;
        }
        this.historyIds = this.ids;
      }
    });
  };

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
      detailPayload.body.entities.forEach(entity => {
        if (
          isExpectedItemOfThisGroup(
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
    console.log('eneee', needRefreshIndex, payload)
    if (needRefreshIndex) {
      this._updateIndexInfo();
    }
  };

  @computed
  get imageWidth() {
    const { viewport: {origWidth} } = this.pages[0];
    return origWidth || this.props.initialOptions.initialWidth;
  }

  @computed
  get imageHeight() {
    const { viewport: {origHeight} } = this.pages[0];
    return origHeight || this.props.initialOptions.initialHeight;
  }

  updateSenderInfo = async () => {
    const { groupId } = this.props;
    const post = await this._item.getDirectRelatedPostInGroup(groupId);

    if (post) {
      this._sender = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        post.creator_id,
      );
      this._createdAt = post.created_at;
      return;
    }
    this._sender = null;
    this._createdAt = null;
    return;
  };

  @computed
  private get _item() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this.currentItemId);
  }

  @computed
  get pages() {
    const { origHeight, origWidth } = this._item;
    if (FileItemUtils.isSupportPreview(this._item)) {
      return [{
        url: this._largeRawImageURL,
        viewport: {
          origHeight,
          origWidth,
        },
      }];
    }
    return [{
      url: undefined,
      viewport: {
        origHeight: 0,
        origWidth: 0,
      },
    }];
  }

  @computed
  get title() {
    let userDisplayName = '';
    let createdAt = '';
    let uid;
    if (this._sender) {
      userDisplayName = this._sender.userDisplayName;
      uid = this._sender.id;
    }
    if (this._createdAt) {
      createdAt = dateFormatter.dateAndTimeWithoutWeekday(
        moment(this._createdAt),
      );
    }
    const { name, downloadUrl, id } = this._item;
    return {
      uid,
      userDisplayName,
      name,
      downloadUrl,
      createdAt,
      currentPageIdx: this.currentIndex + 1,
      pageTotal: this.total,
      fileId: id,
      groupId: this.props.groupId,
    };
  }

  @computed
  get currentPageIdx() {
    return this.currentIndex;
  }

  @computed
  get currentScale() {
    return 0;
  }

  @action
  onUpdate = () => {};
}

export { ImageViewerViewModel };
