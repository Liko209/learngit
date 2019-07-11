/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:00
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ToastProps } from './Toast/types';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import { notificationData } from '../Notification';

class ToastWrapperViewModel extends AbstractViewModel {
  @computed
  get toasts(): ToastProps[] {
    // return Notification.data || [];
    return notificationData;
  }
}

export { ToastWrapperViewModel };
