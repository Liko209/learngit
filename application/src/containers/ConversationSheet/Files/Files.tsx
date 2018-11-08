/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:11:34
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { FilesView } from './Files.View';
import { FilesViewModel } from './Files.ViewModel';
import { FilesProps } from './types';

const Files = buildContainer<FilesProps>({
  View: FilesView,
  ViewModel: FilesViewModel,
});

export { Files };
