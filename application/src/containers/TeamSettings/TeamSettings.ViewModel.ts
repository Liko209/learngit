/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 16:12:13
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable, action } from 'mobx';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { TeamSettingTypes } from './types';
import { GroupService } from 'sdk/module/group';
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
import { generalErrorHandler } from '@/utils/error';
import { PERMISSION_ENUM } from 'sdk/service';

class TeamSettingsViewModel extends StoreViewModel<{ id: number }> {
  @observable
  nameErrorMsg?: string = '';

  @observable
  allowMemberAddMember: boolean = true;

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get initialData() {
    return {
      name: this._group.displayName,
      description: this._group.description,
      allowMemberAddMember: this.allowMemberAddMember,
    };
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get isAdmin() {
    return this._group.isAdmin;
  }

  @action
  setNameError(msg: string) {
    this.nameErrorMsg = msg;
  }

  @action
  async getTeamSetting() {
    const groupService = new GroupService();
    try {
      const teamSettings = await groupService.getTeamSetting(this.id);
      if (teamSettings.permissionFlags) {
        this.allowMemberAddMember =
          teamSettings.permissionFlags[PERMISSION_ENUM.TEAM_ADD_MEMBER] || true;
      }
    } catch (error) {
      generalErrorHandler(error);
    }
  }

  save = async (params: TeamSettingTypes) => {
    const name = params.name.trim();
    const description = params.description.trim();
    const groupService = new GroupService();
    this.setNameError('');
    try {
      await groupService.updateTeamSetting(this.id, {
        name,
        description,
        permissionFlags: {
          TEAM_ADD_MEMBER: params.allowMemberAddMember,
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
        this.setNameError('alreadyTaken');
        return false;
      }
      if (errorHelper.isNetworkConnectionError(error)) {
        Notification.flashToast({
          message: 'SorryWeWereNotAbleToSaveTheUpdate',
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        Notification.flashToast({
          message: 'SorryWeWereNotAbleToSaveTheUpdateTryAgain',
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
        return false;
      }
      generalErrorHandler(error);
      return true;
    }
  }
}

export { TeamSettingsViewModel };
