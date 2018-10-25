/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
// import { ActionsProps, ActionsViewProps } from './types';
// import { PostService } from 'sdk/service';
import { Item } from 'sdk/models';
import { getEntity } from '@/store/utils';
// import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';
import ItemModel from '@/store/models/Item';
import { FileItemsViewProps } from './types';

const FILE_ICON_MAP = {
  pdf: ['pdf'],
  sheet: ['xlsx', 'xls'],
  ppt: ['ppt', 'pptx', 'potx'],
  ps: ['ps', 'psd'],
};

class FileItemsViewModel extends StoreViewModel<FileItemsViewProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  needPreview = (item: ItemModel) => {
    return (item.pages && item.pages.length > 0) || item.thumbs ? true : false;
  }

  getFileIcon = (fileType: string) => {
    for (const key in FILE_ICON_MAP) {
      if (FILE_ICON_MAP[key].includes(fileType)) {
        return key;
      }
    }
    return null;
  }

  getPreviewFileInfo = (item: ItemModel): string => {
    const { pages, thumbs } = item;
    let previewUrl = '';
    if (pages && pages.length > 0) {
      previewUrl = pages[0].url;
      return previewUrl;
    }
    if (thumbs) {
      for (const key in thumbs) {
        const value = thumbs[key];
        if (typeof value === 'string' && value.indexOf('http') > -1) {
          previewUrl = thumbs[key];
        }
      }
    }
    return previewUrl;
  }

  @computed
  get item() {
    const item = getEntity<Item, ItemModel>(ENTITY_NAME.ITEM, this._id);
    return item;
  }
}

export { FileItemsViewModel };
