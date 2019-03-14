/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-12 10:24:03
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { DownloadView } from './Download.View';
import { DownloadViewModel } from './Download.ViewModel';
import { DownloadProps } from './types';

const Download = buildContainer<DownloadProps>({
  View: DownloadView,
  ViewModel: DownloadViewModel,
});

export { Download };
