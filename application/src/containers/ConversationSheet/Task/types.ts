/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskItem, FileType, ExtendFileItem } from '@/store/models/Items';
import { WithNamespaces } from 'react-i18next';

type Props = {
  ids: number[];
};

type ViewProps = WithNamespaces & {
  ids: number[];
  task: TaskItem;
  files: ExtendFileItem[];
  expandImage: any;
};

export { Props, ViewProps, FileType, ExtendFileItem };
