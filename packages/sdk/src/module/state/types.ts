/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:42:44
 * Copyright © RingCentral. All rights reserved.
 */

import { TASK_DATA_TYPE, GROUP_SECTION_TYPE } from './constants';
import { Group } from '../group/entity';
import { State } from './entity';

type StateHandleTask = {
  type: TASK_DATA_TYPE.STATE;
  data: Partial<State>[];
};

type GroupCursorHandleTask = {
  type: TASK_DATA_TYPE.GROUP_CURSOR;
  data: Partial<Group>[];
};

type DataHandleTask = StateHandleTask | GroupCursorHandleTask;

type DataHandleTaskArray = DataHandleTask[];

type SectionUnread = {
  section: GROUP_SECTION_TYPE;
  unreadCount: number;
  mentionCount: number;
};

export {
  StateHandleTask,
  GroupCursorHandleTask,
  DataHandleTask,
  DataHandleTaskArray,
  SectionUnread,
};
