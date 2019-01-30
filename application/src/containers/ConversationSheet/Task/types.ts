/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import TaskItemModel from '@/store/models/TaskItem';
import { FileType, ExtendFileItem } from '@/store/models/FileItem';
import { Palette } from 'jui/foundation/theme/theme';

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
  color?: [keyof Palette, string];
};

type TaskUpdateViewProps = {
  activityData: ActivityData;
  task: TaskItemModel;
  color?: [keyof Palette, string];
};

export {
  Props,
  TaskUpdateProps,
  ViewProps,
  TaskUpdateViewProps,
  FileType,
  ExtendFileItem,
};
