/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-19 14:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';

import GroupService, {
  CreateTeamOptions,
  GroupErrorTypes,
} from 'sdk/service/group';
import AccountService from 'sdk/service/account';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { BaseError } from 'sdk/utils';
import { Notification } from '../Notification';

class CreateTeamViewModel extends AbstractViewModel {
  @observable
  disabledOkBtn: boolean = true;
  @observable
  nameError: boolean = false;
  @observable
  emailError: boolean = false;
  @observable
  errorMsg: string = '';
  @observable
  emailErrorMsg: string = '';
  @observable
  teamName: string = '';
  @observable
  description: string = '';
  @observable
  serverError: boolean = false;
  @observable
  members: (number | string)[] = [];

  @computed
  get isOpen() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG) || false;
  }

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
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
  }

  @action
  inputReset = () => {
    this.errorMsg = '';
    this.nameError = false;
    this.disabledOkBtn = true;
    this.emailError = false;
    this.serverError = false;
  }

  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.teamName = e.target.value;
    this.disabledOkBtn = e.target.value === '';
    this.errorMsg = '';
    this.nameError = false;
  }

  handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.description = e.target.value;
  }

  handleSearchContactChange = (items: any) => {
    const members = items.map((item: any) => {
      if (item.id) {
        return item.id;
      }
      return item.email;
    });
    this.emailErrorMsg = '';
    this.emailError = false;
    this.members = members;
  }

  @action
  create = async (
    name: string,
    memberIds: (number | string)[],
    description: string,
    options: CreateTeamOptions,
  ) => {
    const { isPublic, canPost } = options;
    const groupService: GroupService = GroupService.getInstance();
    const accountService: AccountService = AccountService.getInstance();
    const creatorId = Number(accountService.getCurrentUserId());
    const result = await groupService.createTeam(
      name,
      creatorId,
      memberIds,
      description,
      {
        isPublic,
        canPost,
      },
    );
    if (result.isErr()) {
      this.createErrorHandler(result.error);
    }
    return result;
  }

  createErrorHandler(error: BaseError) {
    const code = error.code;
    if (code === GroupErrorTypes.ALREADY_TAKEN) {
      this.errorMsg = 'alreadyTaken';
      this.nameError = true;
    } else if (code === GroupErrorTypes.INVALID_FIELD) {
      this.emailErrorMsg = 'InvalidEmail';
      this.emailError = true;
    } else {
      const message = 'WeWerentAbleToCreateTheTeamTryAgain';
      Notification.flashToast({
        message,
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
      });
    }
  }
}

export { CreateTeamViewModel };
