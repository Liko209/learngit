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
import ItemModel from '@/store/models/Item';
import { FilesViewProps, FileType, ExtendFile } from './types';

const FILE_ICON_MAP = {
  pdf: ['pdf'],
  sheet: ['xlsx', 'xls'],
  ppt: ['ppt', 'pptx', 'potx'],
  ps: ['ps', 'psd'],
};

class FilesViewModel extends StoreViewModel<FilesViewProps> {
  @computed
  get _ids() {
    return this.props.ids;
  }

  getFileType = (item: ItemModel): ExtendFile => {
    const fileType: ExtendFile = {
      item,
      type: -1,
      previewUrl: '',
    };

    if (this.isImage(item).isImage) {
      fileType.type = FileType.image;
      fileType.previewUrl = this.isImage(item).previewUrl;
      return fileType;
    }
    if (this.isDocument(item).isDocument) {
      fileType.type = FileType.document;
      fileType.previewUrl = this.isDocument(item).previewUrl;
      return fileType;
    }
    fileType.type = FileType.others;
    return fileType;
  }

  @computed
  get files() {
    const files = {
      [FileType.image]: [],
      [FileType.document]: [],
      [FileType.others]: [],
    };

    this.items.forEach((item: ItemModel) => {
      const file = this.getFileType(item);
      files[file.type].push(file);
    });
    return files;
  }

  getFileIcon = (fileType: string) => {
    for (const key in FILE_ICON_MAP) {
      if (FILE_ICON_MAP[key].includes(fileType)) {
        return key;
      }
    }
    return null;
  }

  isImage(item: ItemModel) {
    const { thumbs, type, url } = item;
    const image = {
      isImage: false,
      previewUrl: '',
    };

    if (type === 'gif') {
      image.isImage = true;
      image.previewUrl = url;
      return image;
    }

    if (thumbs) {
      for (const key in thumbs) {
        const value = thumbs[key];
        if (typeof value === 'string' && value.indexOf('http') > -1) {
          image.isImage = true;
          image.previewUrl = thumbs[key];
        }
      }
    }
    return image;
  }

  isDocument(item: ItemModel) {
    const { pages } = item;
    const document = {
      isDocument: false,
      previewUrl: '',
    };
    if (pages && pages.length > 0) {
      document.isDocument = true;
      document.previewUrl = pages[0].url;
    }
    return document;
  }

  @computed
  get items() {
    return this._ids.map((id: number) => {
      return getEntity<Item, ItemModel>(ENTITY_NAME.ITEM, id);
    });
  }
}

export { FilesViewModel };
