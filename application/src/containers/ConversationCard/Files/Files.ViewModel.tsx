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
import { FilesViewProps, FileType } from './types';

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

  getFileType = (item: ItemModel) => {
    if (!item) return;

    const fileType = {
      item,
      id: -1,
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

  getFileIcon = (fileType: string) => {
    for (const key in FILE_ICON_MAP) {
      if (FILE_ICON_MAP[key].includes(fileType)) {
        return key;
      }
    }
    return null;
  }

  isImage(item: ItemModel) {
    const { thumbs } = item;
    const image = {
      isImage: false,
      previewUrl: '',
    };
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
    const items: any = [];
    this._ids.forEach((id: number) => {
      items.push(getEntity<Item, ItemModel>(ENTITY_NAME.ITEM, id));
    });
    return items;
  }
}

export { FilesViewModel };
