/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskItem, FileType, ExtendFileItem } from '@/store/models/Items';

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
  task: TaskItem;
  files: ExtendFileItem[];
};

type TaskUpdateViewProps = {
  activityData: ActivityData;
  task: TaskItem;
};

export {
  Props,
  TaskUpdateProps,
  ViewProps,
  TaskUpdateViewProps,
  FileType,
  ExtendFileItem,
};
