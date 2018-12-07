/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:00
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ToastProps } from './Toast/types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { AbstractViewModel } from '@/base/AbstractViewModel';

class ToastWrapperViewModel extends AbstractViewModel {
  // toasts = getGlobalValue(GLOBAL_KEYS.TOASTS);
  @computed
  get toasts(): ToastProps[] {
    return getGlobalValue(GLOBAL_KEYS.TOASTS);
  }
}

export { ToastWrapperViewModel };
