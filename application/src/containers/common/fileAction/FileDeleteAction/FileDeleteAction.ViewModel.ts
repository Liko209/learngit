/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:42
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { FileActionViewModel } from '../common/FIleAction.ViewModel';
import { ItemService } from 'sdk/module/item/service';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { getEntity, getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { mainLogger } from 'foundation/log';

class FileDeleteActionViewModel extends FileActionViewModel {
  @observable
  conversationId: number;

  @computed
  get post() {
    const { postId } = this.props;
    if (postId) {
      return getEntity<Post, PostModel>(ENTITY_NAME.POST, postId);
    }
    return null;
  }

  @computed
  get canDelete() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return (
      this._currentItemVersion &&
      this._currentItemVersion.creator_id === currentUserId
    );
  }

  @catchError.flash({
    network: 'message.prompt.deleteFileNetworkError',
    server: 'message.prompt.deleteFileBackendError',
  })
  handleDeleteFile = async () => {
    if (
      !this._currentItemVersion ||
      this._currentItemVersion.deactivated ||
      !this.item.versions
    ) {
      mainLogger.warn('item data not exist', this.item);
      return;
    }

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    await itemService.deleteFile(
      this.fileId,
      this.item.versions
        .slice()
        .reverse()
        .indexOf(this._currentItemVersion) + 1,
    );
    return true;
  };

  private get _currentItemVersion() {
    const fileInConversation = !!this.post;
    if (!this.item.versions) {
      mainLogger.warn('item.versions is undefined', this.item);
      return 0;
    }

    if (fileInConversation) {
      const versionIndex =
        this.item.versions.length - this.post!.fileItemVersion(this.item);
      return this.item.versions[versionIndex];
    }
    return this.item.latestVersion;
  }
}

export { FileDeleteActionViewModel };
