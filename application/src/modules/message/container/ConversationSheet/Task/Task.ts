/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { TaskView } from './Task.View';
import { TaskViewModel } from './Task.ViewModel';
import { Props } from './types';

const Task = buildContainer<Props>({
  View: TaskView,
  ViewModel: TaskViewModel,
});

export { Task, Props };
