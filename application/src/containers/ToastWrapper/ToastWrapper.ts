/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:11
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ToastWrapperView } from './ToastWrapper.View';
import { ToastWrapperViewModel } from './ToastWrapper.ViewModel';
import { ToastWrapperProps } from './types';

const ToastWrapper = buildContainer<ToastWrapperProps>({
  ViewModel: ToastWrapperViewModel,
  View: ToastWrapperView,
});

export { ToastWrapper, ToastWrapperProps };
