/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:42
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { action, computed, observable } from 'mobx';
import { Item } from 'sdk/module/item/entity';
import FileItemModel from '@/store/models/FileItem';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { StoreViewModel } from '@/store/ViewModel';
// import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
// import { AccountService } from 'sdk/module/account';
import { FileDeleteActionProps } from './types';

class FileDeleteActionViewModel extends StoreViewModel<FileDeleteActionProps> {
  @observable
  conversationId: number;

  @computed
  private get _id() {
    return this.props.fileId;
  }

  @computed
  private get item() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get fileName() {
    return this.item.name;
  }

  @computed
  get canDelete() {
    // different situation
    // const userConfig = ServiceLoader.getInstance<AccountService>(
    //   ServiceConfig.ACCOUNT_SERVICE,
    // ).userConfig;
    // const userId = userConfig.getGlipUserId();
    // return userId === this.item.creatorId;
    return true;
  }

  @computed
  private get post() {
    const { postId } = this.props;
    if (postId) {
      return getEntity<Post, PostModel>(ENTITY_NAME.POST, postId);
    }
    return null;
  }

  @computed
  private get versionIndex() {
    const versions = this.item.versions;
    if (this.post && this.post.itemData && versions) {
      const itemData = this.post.itemData;
      if (itemData && itemData.version_map && itemData.version_map[this._id]) {
        const version = itemData.version_map[this._id];
        return versions.length - version;
      }
    }
    return versions.length - 1;
  }

  @action
  handleDeleteFile = () => {
    this.versionIndex;
  }
}

export { FileDeleteActionViewModel };
