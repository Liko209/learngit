/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/module/item/entity';
import { Progress } from 'sdk/module/progress';
import { Post } from 'sdk/module/post/entity';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import {
  PostService,
  notificationCenter,
  ENTITY,
  EVENT_TYPES,
} from 'sdk/service';
import { ItemService } from 'sdk/module';
import FileItemModel from '@/store/models/FileItem';
import { FilesViewProps, FileType } from './types';
import { getFileType } from '../helper';
import PostModel from '@/store/models/Post';

class FilesViewModel extends StoreViewModel<FilesViewProps> {
  private _itemService: ItemService;
  private _postService: PostService;
  @observable
  private _progressMap: Map<number, Progress> = new Map<number, Progress>();

  constructor(props: FilesViewProps) {
    super(props);
    this._itemService = ItemService.getInstance();
    this._postService = PostService.getInstance();
    notificationCenter.on(ENTITY.PROGRESS, this._handleItemChanged);
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
      if (item.deactivated) return;

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

  removeFile = async (id: number) => {
    await this._postService.cancelUpload(this._postId, id);
  }
}

export { FilesViewModel };
