/*
 * @Author: cooper.ruan
 * @Date: 2019-07-29 10:53:31
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { MeetingProps } from './types';
import { MeetingsService } from 'sdk/module/meetings';
import { MEETING_ACTION } from 'sdk/module/meetings/types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GLOBAL_KEYS } from '@/store/constants';
import { mainLogger } from 'foundation/log';
import { promisedComputed } from 'computed-async-mobx';
import { computed } from 'mobx';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { getEntity, getSingleEntity, getGlobalValue } from '@/store/utils';
import { CONVERSATION_TYPES } from '@/constants';
import { ENTITY_NAME, PERMISSION_KEYS } from '@/store';
import UserPermissionModel from '@/store/models/UserPermission';
import { UserPermission } from 'sdk/module/permission/entity';
import { container } from 'framework/ioc';
import { ElectronService } from '@/modules/electron';

class MeetingViewModel extends AbstractViewModel<MeetingProps> {

  startMeeting = async () => {
    const id = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

    const result = await ServiceLoader.getInstance<MeetingsService>(ServiceConfig.MEETINGS_SERVICE).startMeeting([id]);
    if (result.action === MEETING_ACTION.DEEP_LINK && !!result.link) {
      this.openWindow(result.link);
    } else {
      // show alert
      mainLogger.info(result.reason || 'start video error');
    }
  };

  openWindow = (link: string) => {
    if (window.jupiterElectron && window.jupiterElectron.openWindow) {
      const electronService = container.get(ElectronService);
      electronService.openWindow(link);
    } else {
      window.open(link);
    }
  };

  showIcon = promisedComputed(false, async () => {
    const { groupId } = this.props;
    if (groupId) {
      const group = this._group;
      if (group) {
        // not support me conversation now
        return group.type !== CONVERSATION_TYPES.ME && this.canUseVideoCall;
      }
    }
    return false;
  });

  @computed
  get _group() {
    const { groupId } = this.props;
    if (groupId) {
      return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
    }
    return null;
  }

  @computed
  get canUseVideoCall() {
    return getSingleEntity<UserPermission, UserPermissionModel>(
      ENTITY_NAME.USER_PERMISSION,
      PERMISSION_KEYS.CAN_USE_VIDEO_CALL,
    );
  }
}

export { MeetingViewModel };
