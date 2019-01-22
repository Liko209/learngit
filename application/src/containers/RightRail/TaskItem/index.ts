/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-15 16:03:31
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { TaskItemView } from './TaskItem.View';
import { TaskItemViewModel } from './TaskItem.ViewModel';

const TaskItem = buildContainer({
  View: TaskItemView,
  ViewModel: TaskItemViewModel,
});

export { TaskItem };
