/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:11:34
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { FileItemsView } from './FileItems.View';
import { FileItemsViewModel } from './FileItems.ViewModel';
import { FileItemsProps } from './types';

const FileItems = buildContainer<FileItemsProps>({
  View: FileItemsView,
  ViewModel: FileItemsViewModel,
});

export { FileItems };
