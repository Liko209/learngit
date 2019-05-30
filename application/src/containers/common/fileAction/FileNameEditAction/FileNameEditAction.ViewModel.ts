/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { action, computed, observable } from 'mobx';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { catchError } from '@/common/catchError';
import { FileActionViewModel } from '../common/FIleAction.ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ItemService } from 'sdk/module/item';

class FileNameEditActionViewModel extends FileActionViewModel {
  @observable newFileName: string;

  @computed
  get canEditFileName() {
    const groupId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const personId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
    return !group.isThePersonGuest(personId);
  }

  @catchError.flash({
    network: 'message.prompt.editFileNameNetworkError',
    server: 'message.prompt.editFileNameBackendError',
  })
  handleEditFileName = async () => {
    const { id } = this.item;
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    await itemService.editFileName(id, this.newFileName);
    return true;
  }

  @computed
  get fileNameRemoveSuffix() {
    const fileNameArray = this.fileName.split('.');
    if (fileNameArray.length > 1) {
      fileNameArray[fileNameArray.length - 1] = '';
    }
    return fileNameArray.join('');
  }

  formatFileName = (name: string) => {
    return name && name.replace(/^\s*/, '').replace(/[\/\?\,\*\:\&]/g, '_');
  }

  @action
  updateNewFileName = (name: string) => {
    this.newFileName = this.formatFileName(name);
  }
}

export { FileNameEditActionViewModel };
