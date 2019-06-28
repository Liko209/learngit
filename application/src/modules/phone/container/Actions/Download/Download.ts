/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:27:21
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
