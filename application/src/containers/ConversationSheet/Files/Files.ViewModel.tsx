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
import FileItemModal from '@/store/models/FileItem';
import { FilesViewProps, FileType } from './types';
import { getFileType } from '../helper';

class FilesViewModel extends StoreViewModel<FilesViewProps> {
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
}

export { FilesViewModel };
