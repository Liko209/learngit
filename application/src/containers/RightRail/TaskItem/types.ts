/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-15 16:08:46
 * Copyright © RingCentral. All rights reserved.
 */

import TaskItemModel from '@/store/models/TaskItem';
import { Palette } from 'jui/foundation/theme/theme';

type TaskProps = {
  id: number;
};

type TaskItemProps = {
  personName: string;
  dueTime: string;
  task: TaskItemModel;
  color: [keyof Palette, string];
};

export { TaskItemProps, TaskProps };
