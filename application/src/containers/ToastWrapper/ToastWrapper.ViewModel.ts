/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:00
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ToastProps } from './Toast/types';
// import { GLOBAL_KEYS } from '@/store/constants';
// import { getGlobalValue } from '@/store/utils';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import { Notification } from '../Notification';

class ToastWrapperViewModel extends AbstractViewModel {
  @computed
  get toasts(): ToastProps[] {
    return Notification.data;
  }
}

export { ToastWrapperViewModel };
