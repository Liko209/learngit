/*
 * @Author: Peng Yu
 * @Date: 2019-03-13 14:09:22
 * Copyright © RingCentral. All rights reserved.
 */
import { ToastCallError } from '../ToastCallError';
import { Notification } from '@/containers/Notification';
import i18next from 'i18next';

describe('ToastCallError', () => {
  it('should display call error: unknown_error', () => {
    Notification.flagToast = jest.fn();
    const msg = 'unknown_error';
    ToastCallError.toast(msg, 2000);
    expect(Notification.flagToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: i18next.t(msg),
        autoHideDuration: 2000,
      }),
    );
  });

  it('should display call error: No network [JPT-1406]', () => {
    ToastCallError.toast = jest.fn();
    ToastCallError.toastNoNetwork();
    const i18nkey = 'telephony.prompt.NoNetwork';
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display call error: Call failed [JPT-1393]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.CallFailed';
    ToastCallError.toastCallFailed();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display call error: time out [JPT-1407]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.CallTimeout';
    ToastCallError.toastCallTimeout();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display call error: time out [JPT-1547]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.FailedToHold';
    ToastCallError.toastFailedToHold();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display call error: time out [JPT-1549]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.FailedToResume';
    ToastCallError.toastFailedToResume();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display call error: time out [JPT-1610]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.FailedToRecord';
    ToastCallError.toastFailedToRecord();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display call error: time out [JPT-1612]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.FailedToStopRecording';
    ToastCallError.toastFailedToStopRecording();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display lack of recording permission', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.LackOfRecordingPermission';
    ToastCallError.toastLackOfRecordingPermission();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display record on service web', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.RecordOnServiceWeb';
    ToastCallError.toastRecordOnServiceWeb();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display recorded automatically', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.RecordAutomatically';
    ToastCallError.toastRecordAutomatically();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 2000);
  });

  it('should display empty reply message error', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.ReplyCustomMessageEmpty';
    ToastCallError.toastEmptyReplyMessage();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display invalid number error', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.InvalidNumber';
    ToastCallError.toastInvalidNumber();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display park error stop recording', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.ParkErrorStopRecording';
    ToastCallError.toastParkErrorStopRecording();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display park error', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.ParkError';
    ToastCallError.toastParkError();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });
});
