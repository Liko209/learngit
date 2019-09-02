/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/module/item/entity';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress';
import ProgressModel from '@/store/models/Progress';
import { Post } from 'sdk/module/post/entity';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { Notification } from '@/containers/Notification';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { notificationCenter, ENTITY, EVENT_TYPES } from 'sdk/service';
import { ItemService } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';
import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import FileItemModel from '@/store/models/FileItem';
import { FilesViewProps, FileType, ExtendFileItem } from './types';
import { getFileType } from '@/common/getFileType';
import { promisedComputed } from 'computed-async-mobx';
import PostModel from '@/store/models/Post';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { RULE } from '@/common/generateModifiedImageURL';
import { UploadFileTracker } from './UploadFileTracker';
import { getThumbnailURLWithType } from '@/common/getThumbnailURL';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { fileItemAvailable } from './helper';

class FilesViewModel extends StoreViewModel<FilesViewProps> {
  private _itemService: ItemService;
  private _postService: PostService;
  private _deleteIds: Set<number> = new Set();
  @observable
  private _progressMap: Map<number, Progress> = new Map<number, Progress>();
  @observable
  urlMap: Map<number, string> = new Map();

  constructor(props: FilesViewProps) {
    super(props);
    this._itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    this._postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    const { ids } = props;
    if (ids.some(looper => looper < 0)) {
      notificationCenter.on(ENTITY.PROGRESS, this._handleItemChanged);
      UploadFileTracker.init();
    }
    this.autorun(() => {
      const images = this.files[FileType.image];
      if (images.length > 0) {
        this.getCropImage();
      }
    });
  }

  isRecentlyUploaded = (id: number) =>
    UploadFileTracker.tracker().getMapID(id) !== id;

  getCropImage = async () => {
    const images = this.files[FileType.image];
    const rule = images.length > 1 ? RULE.SQUARE_IMAGE : RULE.RECTANGLE_IMAGE;
    await Promise.all(
      images.map((file: ExtendFileItem) => this._fetchUrl(file, rule)),
    );
  };

  getShowDialogPermission = async () => {
    const permissionService = ServiceLoader.getInstance<PermissionService>(
      ServiceConfig.PERMISSION_SERVICE,
    );
    return await permissionService.hasPermission(
      UserPermissionType.JUPITER_CAN_SHOW_IMAGE_DIALOG,
    );
  };

  getFilePreviewBackgroundContainPermission = promisedComputed(
    false,
    async () => {
      const permissionService = ServiceLoader.getInstance<PermissionService>(
        ServiceConfig.PERMISSION_SERVICE,
      );
      return await permissionService.hasPermission(
        UserPermissionType.CAN_VIEW_FILE_PREVIEW_BACKGROUND_CONTAIN,
      );
    },
  );

  @action
  private _fetchUrl = async (
    { item }: ExtendFileItem,
    rule: RULE,
  ): Promise<string> => {
    const thumbnail = await getThumbnailURLWithType(item, rule);
    if (thumbnail.url) {
      this.urlMap.set(item.id, thumbnail.url);
    }
    return thumbnail.url;
  };

  private _handleItemChanged = (
    payload: NotificationEntityPayload<Progress>,
  ) => {
    const { type } = payload;
    if (type === EVENT_TYPES.UPDATE) {
      const data: any = payload;
      const { ids, entities } = data.body;
      ids.forEach((looper: number) => {
        const newItem: Progress = entities.get(looper);
        this._progressMap.set(looper, newItem);
      });
    }
  };

  dispose = () => {
    super.dispose();
    notificationCenter.off(ENTITY.PROGRESS, this._handleItemChanged);
  };

  @computed
  get _ids() {
    return this.props.ids;
  }

  @computed
  get files() {
    const files = {
      [FileType.image]: [],
      [FileType.document]: [],
      [FileType.others]: [],
    };
    this.items.forEach((item: FileItemModel) => {
      if (!item) {
        return;
      }
      if (!fileItemAvailable(item, this.post)) {
        return;
      }
      const file = getFileType(item);
      file.item = item;
      files[file.type].push(file);
    });
    return files;
  }

  @computed
  get items() {
    const result: FileItemModel[] = [];
    this._ids.forEach((id: number) => {
      if (!this._deleteIds.has(id)) {
        const item = getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, id);
        result.push(item);
      }
    });
    return result;
  }

  @computed
  get progresses() {
    const result = new Map<number, number>();
    this._ids.forEach((id: number) => {
      if (id < 0) {
        const progress =
          this._progressMap.get(id) || this._itemService.getUploadProgress(id);
        if (progress && progress.rate) {
          const { loaded = 0, total } = progress.rate;
          const value = (loaded / Math.max(total, 1)) * 100;
          if (value > 100) {
            throw Error('Fatal: the file sending progress > 100');
          }
          result.set(id, value);
        }
      } else {
        result.set(id, 100);
      }
    });
    return result;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.postId);
  }

  private _getPostStatus() {
    const progress = getEntity<Progress, ProgressModel>(
      ENTITY_NAME.PROGRESS,
      this.props.postId,
    );
    return progress.progressStatus;
  }

  @computed
  get groupId() {
    return this.post && this.post.groupId;
  }

  removeFile = async (id: number) => {
    const status = getGlobalValue(GLOBAL_KEYS.NETWORK);
    if (status === 'offline') {
      Notification.flashToast({
        message: 'item.prompt.notAbleToCancelUpload',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    } else {
      try {
        const postLoading =
          this._getPostStatus() === PROGRESS_STATUS.INPROGRESS;
        if (postLoading) {
          await this._itemService.cancelUpload(id);
        } else {
          await this._postService.removeItemFromPost(this.props.postId, id);
        }
        this._deleteIds.add(id);
      } catch (e) {
        Notification.flashToast({
          message: 'item.prompt.notAbleToCancelUploadTryAgain',
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
      }
    }
  };
}

export { FilesViewModel };
