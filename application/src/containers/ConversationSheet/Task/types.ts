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
  postId: number;
  ids: number[];
};

type TaskUpdateProps = Props;

type ViewProps = {
  task: TaskItemModel;
  section: string;
  notes: string;
  files: ExtendFileItem[];
  startTime: string;
  endTime: string;
  hasTime: boolean;
  color?: [keyof Palette, string];
  groupId: number;
  getShowDialogPermission: () => Promise<boolean>;
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
