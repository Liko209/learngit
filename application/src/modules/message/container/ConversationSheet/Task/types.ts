/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';
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
  startTime: PromisedComputedValue<string>;
  endTime: PromisedComputedValue<string>;
  timeText: PromisedComputedValue<string>;
  hasTime: boolean;
  color?: [keyof Palette, string];
  groupId: number;
  effectiveIds: (number | null)[];
  getShowDialogPermission: () => Promise<boolean>;
};

type TaskUpdateViewProps = {
  activityData: ActivityData;
  task: TaskItemModel;
  color?: [keyof Palette, string];
  effectiveIds: (number | null)[];
};

export {
  Props,
  TaskUpdateProps,
  ViewProps,
  TaskUpdateViewProps,
  FileType,
  ExtendFileItem,
};
