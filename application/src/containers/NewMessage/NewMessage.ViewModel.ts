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
import { GLOBAL_KEYS } from '@/store/constants';
import { matchInvalidEmail } from '@/utils/string';
import { BaseError, ErrorTypes } from 'sdk/utils';

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
  newMessage = async (memberIds: number[], message: string) => {
    const postService: PostService = PostService.getInstance();
    // const groupService: GroupService = GroupService.getInstance();

    const result = await postService.newMessageWithPeopleIds(
      memberIds,
      message,
    );
    if (result.isOk()) {
      return result.data;
    }
    result.isErr() && this.newMessageErrorHandler(result.error);
    return null;
  }

  newMessageErrorHandler(error: BaseError) {
    this.errorUnknown = false;
    const code = error.code;
    if (code === ErrorTypes.API_INVALID_FIELD) {
      const message = error.message;
      if (matchInvalidEmail(message).length > 0) {
        this.errorEmail = matchInvalidEmail(message);
        this.emailErrorMsg = 'Invalid Email';
        this.emailError = true;
      }
    } else {
      this.errorUnknown = true;
    }
  }
}

export { NewMessageViewModel };
