/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 16:12:13
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity, getGlobalValue } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { SaveParams } from './types';
import { GroupService } from 'sdk/module/group';
import { GLOBAL_KEYS } from '@/store/constants';
import { Notification } from '../Notification';
import { errorHelper } from 'sdk/error';
import { ToastType, ToastMessageAlign } from '../ToastWrapper/Toast/types';
import { generalErrorHandler } from '@/utils/error';
class TeamSettingsViewModel extends StoreViewModel<{ id: number }> {
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
  get isAdmin() {
    return this._group.isAdmin;
  }

  save = (params: SaveParams) => {};

  leaveTeam = () => {
    const groupService = new GroupService();
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    try {
      groupService.leaveTeam(userId, this.id);
    } catch (e) {
      this.onLeaveTeamError(e);
    }
  }

  onLeaveTeamError = (e: Error) => {
    const isBackEndError = errorHelper.isBackEndError(e);
    const isNetworkError = errorHelper.isNotNetworkError(e);
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
}

export { TeamSettingsViewModel };
