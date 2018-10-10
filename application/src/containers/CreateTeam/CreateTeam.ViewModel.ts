/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-19 14:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';

import GroupService, { CreateTeamOptions } from 'sdk/service/group';
import AccountService from 'sdk/service/account';
import { IResponseError } from 'sdk/models';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import storeManager from '@/store';

type errorTips = {
  type: string;
  msg: string;
};

class CreateTeamViewModel extends AbstractViewModel {
  @computed
  get isOpen() {
    return getGlobalValue('isShowCreateTeamDialog') || false;
  }

  @action
  updateCreateTeamDialogState = () => {
    const globalStore = storeManager.getGlobalStore();
    const isShowCreateTeamDialog = !globalStore.get('isShowCreateTeamDialog');
    globalStore.set('isShowCreateTeamDialog', isShowCreateTeamDialog);
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
    console.log(result);

    if (result && (result as IResponseError).error) {
      throw this.createErrorHandler(result as IResponseError);
    }

    return result;
  }

  createErrorHandler(result: IResponseError): errorTips {
    const code = result.error.code;
    let errorMsg: errorTips = {
      type: '',
      msg: '',
    };

    if (code === 'already_taken') {
      errorMsg = {
        type: 'already_taken',
        msg: 'already taken',
      };
    }
    if (code === 'invalid_field') {
      errorMsg = {
        type: 'invalid_email',
        msg: 'Invalid Email',
      };
    }
    return errorMsg;
  }
}

export { CreateTeamViewModel, errorTips };
