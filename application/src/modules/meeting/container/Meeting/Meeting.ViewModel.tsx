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
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';
import { mainLogger } from 'sdk';
import { promisedComputed } from 'computed-async-mobx';
import { computed } from 'mobx';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { getEntity, getSingleEntity } from '@/store/utils';
import { CONVERSATION_TYPES } from '@/constants';
import { ENTITY_NAME } from '@/store';
import UserPermissionModel from '@/store/models/UserPermission';
import { UserPermission } from 'sdk/module/permission/entity';

class MeetingViewModel extends AbstractViewModel<MeetingProps> {
  startMeeting = async () => {
    const id = storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const result = await ServiceLoader.getInstance<MeetingsService>(
      ServiceConfig.MEETINGS_SERVICE,
    ).startMeeting([id]);
    if (result.action === MEETING_ACTION.DEEP_LINK) {
      window.open(result.link);
    } else {
      // show alert
      mainLogger.info(result.reason || 'start video error');
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
  private get _group() {
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
      'canUseVideoCall',
    );
  }
}

export { MeetingViewModel };
