/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-19 14:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';

import GroupService, { CreateTeamOptions } from 'sdk/service/group';
import AccountService from 'sdk/service/account';
import { IResponseError } from 'sdk/models';

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

    if ((result as IResponseError).error) {
      return this.createErrorHandle(result as IResponseError);
    }

    return result;
  }

  createErrorHandle(result: IResponseError): string {
    const code = result.error.code;
    let errorMsg;
    if (code === 'already_taken') {
      errorMsg = 'already taken';
    }
    return errorMsg ? errorMsg : result.error.message;
  }
}

export default CreateTeamVM;
