/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ViewerView } from './Viewer.View';
import { ViewerViewModel } from './Viewer.ViewModel';
import { ViewerProps } from './types';

const Viewer = buildContainer<ViewerProps>({
  View: ViewerView,
  ViewModel: ViewerViewModel,
});

export { Viewer };
