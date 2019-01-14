/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-09 14:12:56
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { FileItemView } from './FileItem.View';
import { FileItemViewModel } from './FileItem.ViewModel';

const FileItem = buildContainer({
  View: FileItemView,
  ViewModel: FileItemViewModel,
});

export { FileItem };
