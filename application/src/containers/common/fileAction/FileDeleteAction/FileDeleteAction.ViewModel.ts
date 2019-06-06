/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:42
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { FileActionViewModel } from '../common/FIleAction.ViewModel';
import { AccountService } from 'sdk/module/account';
import { ItemService } from 'sdk/module/item/service';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';

class FileDeleteActionViewModel extends FileActionViewModel {
  @observable
  conversationId: number;

  @computed
  get canDelete() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentUserId = userConfig.getGlipUserId();
    return this._currentItemVersion.creator_id === currentUserId;
  }

  @catchError.flash({
    network: 'message.prompt.deleteFileNetworkError',
    server: 'message.prompt.deleteFileBackendError',
  })
  handleDeleteFile = async () => {
    if (this._currentItemVersion.deactivated) return;

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
  }

  private get _currentItemVersion() {
    const fileInConversation = !!this.post;
    if (fileInConversation) {
      const versionIndex =
        this.item.versions.length - this.post!.fileItemVersion(this.item);
      return this.item.versions[versionIndex];
    }
    return this.item.latestVersion;
  }
}

export { FileDeleteActionViewModel };
