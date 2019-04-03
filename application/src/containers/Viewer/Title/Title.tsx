/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ViewerTitleView } from './Title.View';
import { ViewerTitleViewModel } from './Title.ViewModel';
import { ViewerTitleProps } from './types';

const ViewerTitle = buildContainer<ViewerTitleProps>({
  View: ViewerTitleView,
  ViewModel: ViewerTitleViewModel,
});

export { ViewerTitle, ViewerTitleProps };
