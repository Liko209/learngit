/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 16:12:13
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { computed, observable, action } from 'mobx';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { TeamSettingTypes } from './types';
import { GroupService } from 'sdk/module/group';
import { GLOBAL_KEYS } from '@/store/constants';
import { generalErrorHandler } from '@/utils/error';
import { catchError } from '@/common/catchError';
import {
  ErrorParserHolder,
  ERROR_TYPES,
  ERROR_CODES_SERVER,
  errorHelper,
} from 'sdk/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class TeamSettingsViewModel extends StoreViewModel<{ id: number }> {
  @observable
  nameErrorMsg?: string = '';

  @observable
  saving: boolean = false;

  @computed
  get permissionFlags() {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const permissionFlags = groupService.getTeamUserPermissionFlags(
      this._group.permissions || {},
    );
    return permissionFlags;
  }

  @computed
  get allowMemberAddMember() {
    return !!this.permissionFlags.TEAM_ADD_MEMBER;
  }

  @computed
  get allowMemberPost() {
    return !!this.permissionFlags.TEAM_POST;
  }

  @computed
  get allowMemberPin() {
    return !!this.permissionFlags.TEAM_PIN_POST;
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get initialData() {
    return {
      name: this._group.displayName,
      description: this._group.description || '',
      allowMemberAddMember: this.allowMemberAddMember,
      allowMemberPost: this.allowMemberPost,
      allowMemberPin: this.allowMemberPin,
    };
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get groupName() {
    return this._group.displayName;
  }

  @computed
  get isAdmin() {
    return this._group.isAdmin;
  }

  @computed
  get isCompanyTeam() {
    return this._group.isCompanyTeam;
  }

  @catchError.flash({
    isDebounce: true,
    network: 'people.prompt.leaveTeamNetworkErrorContent',
    server: 'people.prompt.leaveTeamServerErrorContent',
  })
  leaveTeam = async () => {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    await groupService.leaveTeam(userId, this.id);
  }

  @action
  @catchError.flash({
    isDebounce: true,
    network: 'people.prompt.leaveTeamNetworkErrorContent',
    server: 'people.prompt.leaveTeamServerErrorContent',
  })
  deleteTeam = async () => {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );

    await groupService.deleteTeam(this.id);
    this._onActionSuccess('people.team.deleteTeamSuccessMsg');
    return true;
  }

  @action
  @catchError.flash({
    isDebounce: true,
    network: 'people.prompt.archiveTeamNetworkErrorContent',
    server: 'people.prompt.archiveTeamServerErrorContent',
  })
  archiveTeam = async () => {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    await groupService.archiveTeam(this.id);
    this._onActionSuccess('people.team.archiveTeamSuccessMsg');
    return true;
  }

  private _onActionSuccess = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.SUCCESS,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  @action
  setNameError(msg: string) {
    this.nameErrorMsg = msg;
  }

  @action
  save = async (params: TeamSettingTypes) => {
    if (this.saving) {
      return false;
    }
    const name = params.name.trim();
    const description = params.description.trim();
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    this.setNameError('');
    this.saving = true;
    try {
      await groupService.updateTeamSetting(this.id, {
        name,
        description,
        permissionFlags: {
          TEAM_ADD_MEMBER: params.allowMemberAddMember,
          TEAM_POST: params.allowMemberPost,
          TEAM_PIN_POST: params.allowMemberPin,
        },
      });
      return true;
    } catch (error) {
      if (
        ErrorParserHolder.getErrorParser()
          .parse(error)
          .isMatch({
            type: ERROR_TYPES.SERVER,
            codes: [ERROR_CODES_SERVER.ALREADY_TAKEN],
          })
      ) {
        this.setNameError('people.prompt.alreadyTaken');
        return false;
      }
      if (errorHelper.isNetworkConnectionError(error)) {
        Notification.flashToast({
          message: 'people.prompt.SorryWeWereNotAbleToSaveTheUpdate',
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        Notification.flashToast({
          message: 'people.prompt.SorryWeWereNotAbleToSaveTheUpdateTryAgain',
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
        return false;
      }
      generalErrorHandler(error);
      return true;
    } finally {
      this.saving = false;
    }
  }
}

export { TeamSettingsViewModel };
