/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:53
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';

import PostService from 'sdk/service/post';
// import GroupService from 'sdk/service/group';
import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { matchInvalidEmail } from '@/utils/string';
import { BaseError } from 'sdk/src/utils';
import { GroupErrorTypes } from 'sdk/service/group';

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

  @computed
  get disabledOkBtn() {
    return this.isOffline || this.members.length === 0;
  }

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
    globalStore.set(GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG, !this.isOpen);
  }

  @action
  updateCreateTeamDialogState = () => {
    const globalStore = storeManager.getGlobalStore();
    const isShowCreateTeamDialog = !globalStore.get(
      GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG,
    );
    globalStore.set(
      GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG,
      isShowCreateTeamDialog,
    );
    this.updateNewMessageDialogState();
  }

  @action
  inputReset = () => {
    this.emailErrorMsg = '';
    // this.members = [];
    this.emailError = false;
    this.serverError = false;
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
  newMessage = async (memberIds: number[], message: string) => {
    const postService: PostService = PostService.getInstance();
    // const groupService: GroupService = GroupService.getInstance();
    let result;
    try {
      result = await postService.newMessageWithPeopleIds(memberIds, message);
      // result = await groupService.getGroupByMemberList(memberIds);
    } catch (error) {
      if (error) {
        throw this.newMessageErrorHandler(error);
      } else {
        this.serverError = true;
      }
      return;
    }

    return result;
  }

  newMessageErrorHandler(error: BaseError) {
    const code = error.code;
    if (code === GroupErrorTypes.INVALID_FIELD) {
      const message = error.message;
      if (matchInvalidEmail(message).length > 0) {
        this.errorEmail = matchInvalidEmail(message);
        this.emailErrorMsg = 'Invalid Email';
        this.emailError = true;
      }
    }
  }
}

export { NewMessageViewModel };
