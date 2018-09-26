/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-19 14:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';

import GroupService, { CreateTeamOptions } from 'sdk/service/group';
import AccountService from 'sdk/service/account';
import { IResponseError } from 'sdk/models';

export type errorTips = {
  type: string;
  msg: string;
};

class CreateTeamVM {
  @action
  async create(
    name: string,
    memberIds: (number | string)[],
    description: string,
    options: CreateTeamOptions,
  ) {
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
      throw this.createErrorHandle(result as IResponseError);
    }

    return result;
  }

  createErrorHandle(result: IResponseError): errorTips {
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

export default CreateTeamVM;
