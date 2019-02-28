/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ViewerContentView } from './Content.View';
import { ViewerContentViewModel } from './Content.ViewModel';
import { ViewerContentProps } from './types';

const ViewerContent = buildContainer<ViewerContentProps>({
  View: ViewerContentView,
  ViewModel: ViewerContentViewModel,
});

export { ViewerContent, ViewerContentProps };
