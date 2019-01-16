/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-15 16:08:46
 * Copyright © RingCentral. All rights reserved.
 */

import TaskItemModel from '@/store/models/TaskItem';

type TaskProps = {
  id: number;
};

type TaskItemProps = {
  subTitle: string;
  creator: string;
  createdAt: string;
  task: TaskItemModel;
};

export { TaskItemProps, TaskProps };
