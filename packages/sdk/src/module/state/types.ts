/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:42:44
 * Copyright © RingCentral. All rights reserved.
 */

import { TASK_DATA_TYPE } from './constants';
import { Group } from '../group/entity';
import { State } from './entity';

type stateHandleTask = {
  type: TASK_DATA_TYPE.STATE;
  data: Partial<State>[];
};

type groupHandleTask = {
  type: TASK_DATA_TYPE.GROUP;
  data: Partial<Group>[];
};

type dataHandleTask = stateHandleTask | groupHandleTask;

type dataHandleTaskArray = dataHandleTask[];

export {
  stateHandleTask,
  groupHandleTask,
  dataHandleTask,
  dataHandleTaskArray,
};
