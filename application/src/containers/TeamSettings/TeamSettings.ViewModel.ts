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

type ActionErrorOptions = {
  backendErrorMessage: string;
  networkErrorMessage: string;
};
class TeamSettingsViewModel extends StoreViewModel<{ id: number }> {
  @observable
  nameErrorMsg?: string = '';

  @observable
  saving: boolean = false;

  @computed
  get permissionFlags() {
    const groupService: GroupService = GroupService.getInstance();
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

  leaveTeam = async () => {
    const groupService: GroupService = GroupService.getInstance();
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    try {
      await groupService.leaveTeam(userId, this.id);
    } catch (e) {
      this._onActionError(e, {
        backendErrorMessage: 'people.prompt.leaveTeamServerErrorContent',
        networkErrorMessage: 'people.prompt.leaveTeamNetworkErrorContent',
      });
    }
  }

  @action
  deleteTeam = async () => {
    const groupService: GroupService = GroupService.getInstance();

    try {
      await groupService.deleteTeam(this.id);
      this._onActionSuccess('people.team.deleteTeamSuccessMsg');
      return true;
    } catch (e) {
      this._onActionError(e, {
        backendErrorMessage: 'people.prompt.deleteTeamServerErrorContent',
        networkErrorMessage: 'people.prompt.deleteTeamNetworkErrorContent',
      });
      return false;
    }
  }

  @action
  archiveTeam = async () => {
    const groupService: GroupService = GroupService.getInstance();

    try {
      await groupService.archiveTeam(this.id);
      this._onActionSuccess('people.team.archiveTeamSuccessMsg');
      return true;
    } catch (e) {
      this._onActionError(e, {
        backendErrorMessage: 'people.prompt.archiveTeamServerErrorContent',
        networkErrorMessage: 'people.prompt.archiveTeamNetworkErrorContent',
      });
      return false;
    }
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

  private _onActionError = (e: Error, options: ActionErrorOptions) => {
    const isBackEndError = errorHelper.isBackEndError(e);
    const isNetworkError = errorHelper.isNetworkConnectionError(e);
    let message = '';
    if (isBackEndError) {
      message = options.backendErrorMessage;
    }
    if (isNetworkError) {
      message = options.networkErrorMessage;
    }
    if (message) {
      return Notification.flashToast({
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
    return generalErrorHandler(e);
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
    const groupService: GroupService = GroupService.getInstance();
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
