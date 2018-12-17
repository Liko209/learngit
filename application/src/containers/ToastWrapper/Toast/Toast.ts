/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:11
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ToastView } from './Toast.View';
import { ToastViewModel } from './Toast.ViewModel';
import { ToastProps } from './types';

const Toast = buildContainer<ToastProps>({
  ViewModel: ToastViewModel,
  View: ToastView,
});

export { Toast, ToastProps };
