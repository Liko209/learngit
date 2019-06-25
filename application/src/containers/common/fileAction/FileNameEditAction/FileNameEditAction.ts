/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FileNameEditActionView } from './FileNameEditAction.View';
import { FileNameEditActionViewModel } from './FileNameEditAction.ViewModel';
import { FileNameEditActionProps } from './types';

const FileNameEditAction = buildContainer<FileNameEditActionProps>({
  View: FileNameEditActionView,
  ViewModel: FileNameEditActionViewModel,
});

export { FileNameEditAction };
