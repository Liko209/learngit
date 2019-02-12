/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-19 14:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';

import GroupService, { TeamSetting, Group } from 'sdk/module/group';
import { UserConfig } from 'sdk/service/account';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { matchInvalidEmail } from '@/utils/string';
import { JError, ERROR_TYPES, ERROR_CODES_SERVER } from 'sdk/error';

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
  @observable
  serverUnknownError: boolean = false;

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    this.teamName = name;
    this.disabledOkBtn = name === '';
    this.errorMsg = '';
    this.nameError = false;
  }

  handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.description = e.target.value.trim();
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
  create = async (memberIds: (number | string)[], options: TeamSetting): Promise<Group | null> => {
    const groupService: GroupService = GroupService.getInstance();
    const creatorId = Number(UserConfig.getCurrentUserId());
    try {
      return await groupService.createTeam(creatorId, memberIds, options);
    } catch (error) {
      this.createErrorHandler(error);
      return null;
    }
  }

  createErrorHandler(error: JError) {
    this.serverUnknownError = false;
    if (
      error.isMatch({
        type: ERROR_TYPES.SERVER,
        codes: [ERROR_CODES_SERVER.ALREADY_TAKEN],
      })
    ) {
      this.errorMsg = 'alreadyTaken';
      this.nameError = true;
    } else if (
      error.isMatch({
        type: ERROR_TYPES.SERVER,
        codes: [ERROR_CODES_SERVER.INVALID_FIELD],
      })
    ) {
      const message = error.message;
      if (matchInvalidEmail(message).length > 0) {
        this.errorEmail = matchInvalidEmail(message);
        this.emailErrorMsg = 'Invalid Email';
        this.emailError = true;
      }
    } else {
      this.serverUnknownError = true;
    }
  }
}

export { CreateTeamViewModel };
