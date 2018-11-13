/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskItem, FileType, ExtendFileItem } from '@/store/models/Items';
import Post from '@/store/models/Post';
import { WithNamespaces } from 'react-i18next';

type Props = {
  ids: number[];
};

type TaskUpdateProps = {
  postId: number;
} & Props;

type ViewProps = WithNamespaces & {
  ids: number[];
  task: TaskItem;
  files: ExtendFileItem[];
  expandImage: any;
};

type TaskUpdateViewProps = {
  post: Post;
  postId: number;
} & ViewProps;

export {
  Props,
  TaskUpdateProps,
  ViewProps,
  TaskUpdateViewProps,
  FileType,
  ExtendFileItem,
};
