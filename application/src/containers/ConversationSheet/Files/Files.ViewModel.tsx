/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item, Progress } from 'sdk/models';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import {
  ItemService,
  notificationCenter,
  ENTITY,
  EVENT_TYPES,
} from 'sdk/service';
import FileItemModal from '@/store/models/FileItem';

import { FilesViewProps, FileType } from './types';
import { getFileType } from '../helper';

class FilesViewModel extends StoreViewModel<FilesViewProps> {
  private _itemService: ItemService;
  @observable
  private _progressMap: Map<number, Progress> = new Map<number, Progress>();

  constructor(props: FilesViewProps) {
    super(props);
    this._itemService = ItemService.getInstance();
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
    this.items.forEach((item: FileItemModal) => {
      const file = getFileType(item);
      files[file.type].push(file);
    });
    return files;
  }

  @computed
  get items() {
    return this._ids.map((id: number) => {
      return getEntity<Item, FileItemModal>(ENTITY_NAME.FILE_ITEM, id);
    });
  }

  @computed
  get progresses() {
    const result = new Map<number, number>();
    this._ids.forEach((id: number) => {
      let progress = this._progressMap.get(id);
      if (!process) {
        progress = this._itemService.getUploadProgress(id);
      }
      let value = 0;
      if (progress) {
        value = (progress.loaded / progress.total) * 100;
      }
      result.set(id, value);
    });
    return result;
  }

  removeFile = async (id: number) => {
    await this._itemService.cancelUpload(id);
  }
}

export { FilesViewModel };
