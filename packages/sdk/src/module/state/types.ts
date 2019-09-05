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

type GroupCursorHandleTask = {
  type: TASK_DATA_TYPE.GROUP_CURSOR;
  data: Partial<Group>[];
  ignoreCursorValidate?: boolean;
};

type StateAndGroupCursorHandleTask = {
  type: TASK_DATA_TYPE.STATE_AND_GROUP_CURSOR;
  data: {
    states: Partial<State>[];
    groups: Partial<Group>[];
  };
  ignoreCursorValidate?: boolean;
};

type GroupStateHandleTask = {
  type: TASK_DATA_TYPE.GROUP_STATE;
  data: NotificationEntityPayload<GroupState>;
};

type GroupEntityHandleTask = {
  type: TASK_DATA_TYPE.GROUP_ENTITY;
  data: Group[];
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
  GroupCursorHandleTask,
  StateAndGroupCursorHandleTask,
  GroupStateHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
  GroupBadge,
  INIT_STATUS,
};
