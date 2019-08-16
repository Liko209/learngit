/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-19 14:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import GroupService, { TeamSetting, Group } from 'sdk/module/group';
import { AccountService } from 'sdk/module/account';
import { dataAnalysis } from 'foundation/analysis';
import { AbstractViewModel } from '@/base';
import { getGlobalValue, getSingleEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { matchInvalidEmail } from '@/utils/string';
import { JError, ERROR_TYPES, ERROR_CODES_SERVER } from 'sdk/error';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { UserPermission } from 'sdk/module/permission/entity';
import UserPermissionModel from '@/store/models/UserPermission';

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
  loading: boolean = false;

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  @computed
  get canMentionTeam() {
    return getSingleEntity<UserPermission, UserPermissionModel>(
      ENTITY_NAME.USER_PERMISSION,
      'canMentionTeam',
    );
  }

  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    this.teamName = name;
    this.disabledOkBtn = name === '';
    this.errorMsg = '';
    this.nameError = false;
  };

  handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.description = e.target.value.trim();
  };

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
  };

  @action
  create = async (
    memberIds: (number | string)[],
    options: TeamSetting,
  ): Promise<Group | null> => {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const creatorId = userConfig.getGlipUserId();
    try {
      this.loading = true;
      const personIds = await groupService.getPersonIdsBySelectedItem(
        memberIds,
      );
      const result = await groupService.createTeam(
        creatorId,
        personIds,
        options,
      );
      if (_.get(options, 'permissionFlags.TEAM_MENTION')) {
        dataAnalysis.track('Jup_Web/DT_Messaging_Team_teamMentionSetting');
      }
      this.loading = false;
      return result;
    } catch (error) {
      this.loading = false;
      const unkonwnError = this.createErrorHandler(error);
      if (unkonwnError) {
        throw new Error();
      }
      return null;
    }
  };

  createErrorHandler(error: JError) {
    let serverUnknownError = false;
    if (
      error.isMatch({
        type: ERROR_TYPES.SERVER,
        codes: [ERROR_CODES_SERVER.ALREADY_TAKEN],
      })
    ) {
      this.errorMsg = 'people.prompt.alreadyTaken';
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
        this.emailErrorMsg = 'people.prompt.InvalidEmail';
        this.emailError = true;
      }
    } else {
      serverUnknownError = true;
    }
    return serverUnknownError;
  }
}

export { CreateTeamViewModel, TeamSetting };
