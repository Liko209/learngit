/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-19 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import i18nT from '@/utils/i18nT';

export const showNotImageTypeToast = async (type: File['type']) => {
  if (!type) return;
  if (!/image\/*/.test(type)) {
    Notification.flashToast({
      message: await i18nT('message.prompt.editPhotoFileTypeError'),
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
    return;
  }
  return true;
};
