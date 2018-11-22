/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:53
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';

import PostService from 'sdk/service/post';
import { IResponseError } from 'sdk/models';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

class NewMessageViewModel extends AbstractViewModel {
  @observable
  disabledOkBtn: boolean = true;
  @observable
  emailError: boolean = false;
  @observable
  emailErrorMsg: string = '';
  @observable
  serverError: boolean = false;
  @observable
  members: (number | string)[] = [];

  @computed
  get isOpen() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG) || false;
  }

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  @action
  updateNewMessageDialogState = () => {
    const globalStore = storeManager.getGlobalStore();
    const isShowNewMessageDialog = !globalStore.get(
      GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG,
    );
    globalStore.set(
      GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG,
      isShowNewMessageDialog,
    );
  }

  @action
  inputReset = () => {
    this.emailErrorMsg = '';
    this.disabledOkBtn = true;
    this.emailError = false;
    this.serverError = false;
  }

  handleSearchContactChange = (items: any) => {
    const members = items.map((item: any) => {
      if (item.id) {
        return item.id;
      }
      return item.email;
    });
    this.disabledOkBtn = members.length === 0;
    this.emailErrorMsg = '';
    this.emailError = false;
    this.members = members;
  }

  @action
  newMessage = async (memberIds: number[], message: string) => {
    const postService: PostService = PostService.getInstance();
    let result;
    try {
      result = await postService.newMessageWithPeopleIds(memberIds, message);
    } catch (err) {
      const { data } = err;
      if (data) {
        throw this.newMessageErrorHandler(data as IResponseError);
      } else {
        this.serverError = true;
      }
      return;
    }

    return result;
  }

  newMessageErrorHandler(error: IResponseError) {
    const code = error.error.code;
    if (code === 'invalid_field') {
      this.emailErrorMsg = 'Invalid Email';
      this.emailError = true;
    }
  }
}

export { NewMessageViewModel };
