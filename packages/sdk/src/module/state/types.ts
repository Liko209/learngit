/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:42:44
 * Copyright © RingCentral. All rights reserved.
 */

import { TASK_TYPE, UMI_SECTION_TYPE } from './constants';
import { Group } from '../group/entity';
import { State, GroupState } from './entity';
import { Profile } from '../profile/entity';
import { NotificationEntityPayload } from '../../service/notificationCenter';

type StateHandleTask = {
  type: TASK_TYPE.HANDLE_STATE;
  data: Partial<State>[];
};

type GroupStateHandleTask = {
  type: TASK_TYPE.HANDLE_GROUP_STATE;
  data: GroupState[];
};

type GroupCursorHandleTask = {
  type: TASK_TYPE.HANDLE_GROUP_CURSOR;
  data: Partial<Group>[];
};

type GroupEntityHandleTask = {
  type: TASK_TYPE.HANDLE_GROUP_ENTITY;
  data: NotificationEntityPayload<Group>;
};

type ProfileEntityHandleTask = {
  type: TASK_TYPE.HANDLE_PROFILE_ENTITY;
  data: NotificationEntityPayload<Profile>;
};

type SectionUnread = {
  section: UMI_SECTION_TYPE;
  unreadCount: number;
  mentionCount: number;
  isTeam?: boolean;
};

export {
  StateHandleTask,
  GroupStateHandleTask,
  GroupCursorHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
  SectionUnread,
};
