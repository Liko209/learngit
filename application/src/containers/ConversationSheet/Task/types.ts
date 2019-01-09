/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import TaskItemModel from '@/store/models/TaskItem';
import { FileType, ExtendFileItem } from '@/store/models/FileItem';

type ActivityData = {
  [index: string]: any;
};

type Props = {
  ids: number[];
};

type TaskUpdateProps = {
  postId: number;
} & Props;

type ViewProps = {
  task: TaskItemModel;
  files: ExtendFileItem[];
  startTime: string;
  endTime: string;
  hasTime: boolean;
};

type TaskUpdateViewProps = {
  activityData: ActivityData;
  task: TaskItemModel;
};

export {
  Props,
  TaskUpdateProps,
  ViewProps,
  TaskUpdateViewProps,
  FileType,
  ExtendFileItem,
};
