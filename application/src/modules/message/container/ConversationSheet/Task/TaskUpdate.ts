/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-13 16:50:52
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { TaskUpdateView } from './TaskUpdate.View';
import { TaskUpdateViewModel } from './TaskUpdate.ViewModel';
import { TaskUpdateProps } from './types';

const TaskUpdate = buildContainer<TaskUpdateProps>({
  ViewModel: TaskUpdateViewModel,
  View: TaskUpdateView,
});

export { TaskUpdate, TaskUpdateProps };
