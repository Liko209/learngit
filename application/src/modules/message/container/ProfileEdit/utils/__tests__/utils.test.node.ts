/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-19 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { showNotImageTypeToast } from '../index';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';

jest.mock('@/containers/Notification');
jest.mock('@/utils/i18nT', () => (key: string) => key);

function toastParamsBuilder(message: string) {
  return {
    message,
    type: ToastType.ERROR,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
  };
}

describe('showNotImageTypeToast()', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn();
  });
  it('Should not show error when type is image/*', async () => {
    await showNotImageTypeToast('image/gif');
    expect(Notification.flashToast).not.toHaveBeenCalled();
  });
  it('Should not show error when not type', async () => {
    await showNotImageTypeToast(null);
    expect(Notification.flashToast).not.toHaveBeenCalled();
  });

  it('Should show a flash toast when type not image/*', async (done: jest.DoneCallback) => {
    await showNotImageTypeToast('file/doc');
    expect(Notification.flashToast).toHaveBeenCalledWith(
      toastParamsBuilder('message.prompt.editPhotoFileTypeError'),
    );
    done();
  });
});
