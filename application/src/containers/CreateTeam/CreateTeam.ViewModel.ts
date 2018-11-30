/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-19 14:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';
import GroupService, { CreateTeamOptions } from 'sdk/service/group';
import AccountService from 'sdk/service/account';
import { IResponseError } from 'sdk/models';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

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
  @observable
  errorEmail: string;

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
    let result;
    try {
      result = await groupService.createTeam(
        name,
        creatorId,
        memberIds,
        description,
        {
          isPublic,
          canPost,
        },
      );
    } catch (err) {
      const { data } = err;
      if (data) {
        throw this.createErrorHandler(data as IResponseError);
      } else {
        this.serverError = true;
      }
      return;
    }

    return result;
  }

  createErrorHandler(errorData: IResponseError) {
    const code = errorData.error.code;
    if (code === 'already_taken') {
      this.errorMsg = 'already taken';
      this.nameError = true;
    } else if (code === 'invalid_field') {
      const message = errorData.error.message;
      // 'This is not a valid email address: q@qq.com .'
      const email = message.substr(0, message.length - 1).split(':')[1];
      this.errorEmail = email.trim();
      this.emailErrorMsg = 'Invalid Email';
      this.emailError = true;
    }
  }
}

export { CreateTeamViewModel };
