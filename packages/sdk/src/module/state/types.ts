/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:42:44
 * Copyright © RingCentral. All rights reserved.
 */

import { TASK_DATA_TYPE } from './constants';
import { Group } from '../group/entity';
import { State, GroupState } from './entity';
import { Profile } from '../profile/entity';
import { NotificationEntityPayload } from '../../service/notificationCenter';
import { Badge } from '../badge/entity';

type StateHandleTask = {
  type: TASK_DATA_TYPE.STATE;
  data: Partial<State>[];
  ignoreCursorValidate?: boolean;
};

type GroupStateHandleTask = {
  type: TASK_DATA_TYPE.GROUP_STATE;
  data: NotificationEntityPayload<GroupState>;
};

type GroupCursorHandleTask = {
  type: TASK_DATA_TYPE.GROUP_CURSOR;
  data: Partial<Group>[];
  ignoreCursorValidate?: boolean;
};

type GroupEntityHandleTask = {
  type: TASK_DATA_TYPE.GROUP_ENTITY;
  data: NotificationEntityPayload<Group>;
};

type ProfileEntityHandleTask = {
  type: TASK_DATA_TYPE.PROFILE_ENTITY;
  data: NotificationEntityPayload<Profile>;
};

type GroupBadge = Badge & {
  mentionCount: number;
  isTeam?: boolean;
};

enum INIT_STATUS {
  IDLE,
  INITIALIZING,
  INITIALIZED,
}

export {
  StateHandleTask,
  GroupStateHandleTask,
  GroupCursorHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
  GroupBadge,
  INIT_STATUS,
};
