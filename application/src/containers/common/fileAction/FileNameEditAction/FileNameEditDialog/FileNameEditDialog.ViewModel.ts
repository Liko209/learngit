/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { action, computed, observable } from 'mobx';
import { catchError } from '@/common/catchError';
import { FileActionViewModel } from '../../common/FIleAction.ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import portalManager from '@/common/PortalManager';
import { ItemService } from 'sdk/module/item';

class FileNameEditDialogViewModel extends FileActionViewModel {
  @observable newFileName: string;
  @observable isLoading: boolean;

  @catchError.flash({
    network: 'message.prompt.editFileNameNetworkError',
    server: 'message.prompt.editFileNameBackendError',
  })
  handleEditFileName = async () => {
    const { id, type } = this.item;
    if (!this.newFileName) {
      portalManager.dismissLast();
      return;
    }
    this.isLoading = true;
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    await itemService
      .editFileName(id, `${this.newFileName}.${type}`)
      .catch(e => {
        this.isLoading = false;
        throw e;
      });
    this.isLoading && portalManager.dismissLast();
    this.isLoading = false;
    return true;
  }

  @computed
  get fileNameRemoveSuffix() {
    const fileNameArray = this.fileName.split('.');
    if (fileNameArray.length > 1) {
      fileNameArray.pop();
    }
    return fileNameArray.join('.');
  }

  formatFileName = (name: string) => {
    return name && name.replace(/^\s*/, '').replace(/[\/\?\,\*\:\&]/g, '_');
  }

  @action
  updateNewFileName = (name: string) => {
    this.newFileName = this.formatFileName(name);
  }
}

export { FileNameEditDialogViewModel };
