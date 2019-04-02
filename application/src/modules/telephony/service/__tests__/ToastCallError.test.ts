/*
 * @Author: Peng Yu
 * @Date: 2019-03-13 14:09:22
 * Copyright © RingCentral. All rights reserved.
 */
import { ToastCallError } from '../ToastCallError';
import { Notification } from '@/containers/Notification';
import i18next from 'i18next';

describe('ToastCallError', () => {
  i18next.t = jest.fn((key: string) => {
    return key;
  });

  it('should display call error: unknow_error', () => {
    Notification.flagToast = jest.fn();
    const msg = 'unknow_error';
    ToastCallError.toast(msg, 2000);
    expect(Notification.flagToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: msg,
        autoHideDuration: 2000,
      }),
    );
  });

  it('should display call error: No network [JPT-1406]', () => {
    ToastCallError.toast = jest.fn();
    ToastCallError.toastNoNetwork();
    const i18nkey = 'telephony.prompt.NoNetwork';
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
    expect(i18next.t).toHaveBeenCalledWith(i18nkey);
  });

  it('should display call error: Call failed [JPT-1393]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.CallFailed';
    ToastCallError.toastCallFailed();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
    expect(i18next.t).toHaveBeenCalledWith(i18nkey);
  });

  it('should display call error: time out [JPT-1407]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.CallTimeout';
    ToastCallError.toastCallTimeout();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
    expect(i18next.t).toHaveBeenCalledWith(i18nkey);
  });

  it('should display call error: time out [JPT-XXXX]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.FailedToHold';
    ToastCallError.toastFailedToHold();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
    expect(i18next.t).toHaveBeenCalledWith(i18nkey);
  });

  it('should display call error: time out [JPT-XXXX]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.FailedToResume';
    ToastCallError.toastFailedToResume();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
    expect(i18next.t).toHaveBeenCalledWith(i18nkey);
  });
});
