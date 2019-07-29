/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { EditProps, EditViewProps } from './types';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { IMessageService } from '@/modules/message/interface';

class EditViewModel extends StoreViewModel<EditProps> implements EditViewProps {
  @IMessageService private _messageService: IMessageService;

  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  get disabled() {
    return this.props.disabled;
  }

  @action
  edit = () => {
    const globalStore = storeManager.getGlobalStore();
    const inEditModePostIds = globalStore.get(
      GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS,
    );
    inEditModePostIds.push(this._id);
    globalStore.set(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS, [...inEditModePostIds]);
    this._messageService.setEditInputFocus(this._id);
  };
}

export { EditViewModel };
