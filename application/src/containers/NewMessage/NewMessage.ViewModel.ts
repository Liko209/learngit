/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:53
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';

import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { goToConversation } from '@/common/goToConversation';

class NewMessageViewModel extends StoreViewModel {
  @observable
  emailError: boolean = false;
  @observable
  emailErrorMsg: string = '';
  @observable
  serverError: boolean = false;
  @observable
  members: (number | string)[] = [];
  @observable
  errorEmail: string;
  @observable
  errorUnknown: boolean = false;

  @computed
  get disabledOkBtn() {
    return this.isOffline || this.members.length === 0;
  }

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  handleSearchContactChange = (items: any) => {
    this.members = items.map((item: any) => {
      if (item.id) {
        return item.id;
      }
      return item.email;
    });
    this.emailErrorMsg = '';
    this.emailError = false;
  }

  @action
  newMessage = async (message: string) => {
    goToConversation({
      message,
      id: Array.from(this.members) as number[],
    });
  }
}

export { NewMessageViewModel };
