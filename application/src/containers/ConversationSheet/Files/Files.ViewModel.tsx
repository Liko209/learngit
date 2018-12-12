/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/models';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { FileItem } from '@/store/models/Items';
import { ItemService } from 'sdk/service';
import { FilesViewProps, FileType } from './types';
import { getFileType } from '../helper';

class FilesViewModel extends StoreViewModel<FilesViewProps> {
  private _itemService: ItemService;

  constructor(props: FilesViewProps) {
    super(props);
    this._itemService = ItemService.getInstance();
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

    this.items.forEach((item: FileItem) => {
      const file = getFileType(item);
      files[file.type].push(file);
    });
    return files;
  }

  @computed
  get items() {
    return this._ids.map((id: number) => {
      return getEntity<Item, FileItem>(ENTITY_NAME.ITEM, id);
    });
  }

  @computed
  get progresses() {
    const result = new Map<number, number>();
    this._ids.forEach((id: number) => {
      const progress = this._itemService.getUploadProgress(id);
      let value = 0;
      if (progress) {
        value = progress.loaded / progress.total;
      }
      result.set(id, value);
    });
    return result;
  }
}

export { FilesViewModel };
