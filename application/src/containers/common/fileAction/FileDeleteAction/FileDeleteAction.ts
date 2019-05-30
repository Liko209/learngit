/*
 * @Author: wayne.zhou
 * @Date: 2019-05-28 09:36:19
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FileDeleteActionView } from './FileDeleteAction.View';
import { FileDeleteActionViewModel } from './FileDeleteAction.ViewModel';
import { FileDeleteActionProps } from './types';

const FileDeleteAction = buildContainer<FileDeleteActionProps>({
  View: FileDeleteActionView,
  ViewModel: FileDeleteActionViewModel,
});

export { FileDeleteAction };
