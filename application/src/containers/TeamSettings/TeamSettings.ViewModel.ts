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
import { SaveParams } from './types';
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

class TeamSettingsViewModel extends StoreViewModel<{ id: number }> {
  @observable
  nameErrorMsg?: string = '';

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get initialData() {
    return {
      name: this._group.displayName,
      description: this._group.description,
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

  leaveTeam = async () => {
    const groupService = new GroupService();
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    try {
      await groupService.leaveTeam(userId, this.id);
    } catch (e) {
      this.onLeaveTeamError(e);
    }
  }

  onLeaveTeamError = (e: Error) => {
    const isBackEndError = errorHelper.isBackEndError(e);
    const isNetworkError = errorHelper.isNetworkConnectionError(e);
    let message = '';
    if (isBackEndError) {
      message = 'leaveTeamServerErrorContent';
    }
    if (isNetworkError) {
      message = 'leaveTeamNetworkErrorContent';
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

  save = async (params: SaveParams) => {
    const name = params.name.trim();
    const description = params.description.trim();
    const groupService = new GroupService();
    this.setNameError('');
    try {
      await groupService.updateTeamSetting(this.id, {
        name,
        description,
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
