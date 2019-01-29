/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/module/item/entity';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress';
import ProgressModel from '@/store/models/Progress';
import { Post } from 'sdk/module/post/entity';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { t } from 'i18next';
import { Notification } from '@/containers/Notification';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import {
  PostService,
  notificationCenter,
  ENTITY,
  EVENT_TYPES,
} from 'sdk/service';
import { ItemService } from 'sdk/module/item';
import FileItemModel from '@/store/models/FileItem';
import { FilesViewProps, FileType, ExtendFileItem } from './types';
import { getFileType } from '@/common/getFileType';
import PostModel from '@/store/models/Post';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { getThumbnail, RULE } from '@/common/getThumbnail';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';

class FilesViewModel extends StoreViewModel<FilesViewProps> {
  private _itemService: ItemService;
  private _postService: PostService;
  @observable
  private _progressMap: Map<number, Progress> = new Map<number, Progress>();
  @observable
  urlMap: Map<number, string> = new Map();

  constructor(props: FilesViewProps) {
    super(props);
    this._itemService = ItemService.getInstance();
    this._postService = PostService.getInstance();
    const { ids } = props;
    if (ids.some(looper => looper < 0)) {
      notificationCenter.on(ENTITY.PROGRESS, this._handleItemChanged);
    }
    this.reaction(() => ids, this.getCropImage);
  }

  getCropImage = async () => {
    const images = this.files[FileType.image];
    const rule = images.length > 1 ? RULE.SQUARE_IMAGE : RULE.RECTANGLE_IMAGE;
    Promise.all(
      images.map((file: ExtendFileItem) => this.fetchUrl(file, rule)),
    );
  }

  fetchUrl = async ({ item }: ExtendFileItem, rule: RULE) => {
    const { id, origWidth, origHeight, type, versionUrl } = item;
    let url = '';
    // Notes
    // 1. There is no thumbnail for the image just uploaded.
    // 2. tif has thumbnail field.
    // 3. git use original url.
    if (FileItemUtils.isGifItem({ type }) && versionUrl) {
      url = versionUrl;
    } else if (
      origWidth > 0 &&
      origHeight > 0 &&
      FileItemUtils.isSupportPreview({ type })
    ) {
      const thumbnail = await getThumbnail({
        id,
        origWidth,
        origHeight,
        rule,
        squareSize: 180,
      });
      url = thumbnail.url;
    }
    this.urlMap.set(id, url);
  }

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
  }

  dispose = () => {
    notificationCenter.off(ENTITY.ITEM, this._handleItemChanged);
  }

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
      if (item && item.deactivated) return;

      const file = getFileType(item);
      files[file.type].push(file);
    });
    return files;
  }

  @computed
  get items() {
    return this._ids.map((id: number) => {
      return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, id);
    });
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
  get _postId() {
    return this.props.postId;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._postId);
  }

  private _getPostStatus() {
    const progress = getEntity<Progress, ProgressModel>(
      ENTITY_NAME.PROGRESS,
      this._postId,
    );
    return progress.progressStatus;
  }

  removeFile = async (id: number) => {
    const status = getGlobalValue(GLOBAL_KEYS.NETWORK);
    if (status === 'offline') {
      Notification.flashToast({
        message: t('notAbleToCancelUpload'),
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
          await this._postService.removeItemFromPost(this._postId, id);
        }
      } catch (e) {
        Notification.flashToast({
          message: t('notAbleToCancelUploadTryAgain'),
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
      }
    }
  }
}

export { FilesViewModel };
