/*
 * @Author: wayne.zhou
 * @Date: 2019-05-28 09:36:19
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FileDeleteOptionView } from './FileDeleteOption.View';
import { FileDeleteOptionViewModel } from './FileDeleteOption.ViewModel';
import { FileDeleteOptionProps } from './types';

const FileDeleteOption = buildContainer<FileDeleteOptionProps>({
  View: FileDeleteOptionView,
  ViewModel: FileDeleteOptionViewModel,
});

export { FileDeleteOption };
