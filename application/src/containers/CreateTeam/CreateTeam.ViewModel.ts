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

  @computed
  get isOpen() {
    return getGlobalValue('isShowCreateTeamDialog') || false;
  }

  @computed
  get isOffline() {
    return getGlobalValue('network') === 'offline';
  }

  @action
  updateCreateTeamDialogState = () => {
    const globalStore = storeManager.getGlobalStore();
    const isShowCreateTeamDialog = !globalStore.get('isShowCreateTeamDialog');
    globalStore.set('isShowCreateTeamDialog', isShowCreateTeamDialog);
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
      console.log(result);
    } catch (err) {
      this.serverError = true;
      return;
    }

    if (result && (result as IResponseError).error) {
      throw this.createErrorHandler(result as IResponseError);
    }

    return result;
  }

  createErrorHandler(result: IResponseError) {
    const code = result.error.code;
    if (code === 'already_taken') {
      this.errorMsg = 'already taken';
      this.nameError = true;
    } else if (code === 'invalid_field') {
      this.emailErrorMsg = 'Invalid Email';
      this.emailError = true;
    }
  }
}

export { CreateTeamViewModel };
