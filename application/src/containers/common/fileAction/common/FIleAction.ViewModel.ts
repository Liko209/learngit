/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { computed } from 'mobx';
import { Item } from 'sdk/module/item/entity';
import FileItemModel from '@/store/models/FileItem';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { StoreViewModel } from '@/store/ViewModel';
import { FileActionProps } from './types';

class FileActionViewModel extends StoreViewModel<FileActionProps> {
  @computed
  private get _id() {
    return this.props.fileId;
  }

  @computed
  get item() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get fileName() {
    return this.item.name;
  }

  @computed
  get post() {
    const { postId } = this.props;
    if (postId) {
      return getEntity<Post, PostModel>(ENTITY_NAME.POST, postId);
    }
    return null;
  }

  @computed
  get versionIndex() {
    const versions = this.item.versions;
    if (this.post) {
      if (this.post.itemData && versions) {
        const itemData = this.post.itemData;
        if (
          itemData &&
          itemData.version_map &&
          itemData.version_map[this._id]
        ) {
          const version = itemData.version_map[this._id];
          return versions.length - version;
        }
      }
      return versions.length - 1;
    }
    // There is no post data in the right rail
    return 0;
  }
}

export { FileActionViewModel };
