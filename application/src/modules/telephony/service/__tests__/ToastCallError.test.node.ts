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

  it('should display permission error', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.NoCallPermission';
    ToastCallError.toastPermissionError();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display country block error', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.CountryBlock';
    ToastCallError.toastCountryBlockError();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display voip unavailable error', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.VoipUnavailable';
    ToastCallError.toastVoipUnavailableError();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display on-demand error [JPT-2427]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.OnDemandRecording';
    ToastCallError.toastOnDemandRecording();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display auto-recording error [JPT-2428]', () => {
    ToastCallError.toast = jest.fn();
    const i18nkey = 'telephony.prompt.AutoRecording';
    ToastCallError.toastAutoRecording();
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should display switch call error: No network [JPT-2532]', () => {
    ToastCallError.toast = jest.fn();
    ToastCallError.toastSwitchCallNoNetwork();
    const i18nkey = 'telephony.prompt.switchCall.noNetwork';
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });

  it('should not transfer with unexpected error [JPT-2765]', () => {
    ToastCallError.toast = jest.fn();
    ToastCallError.toastTransferError();
    const i18nkey = 'telephony.prompt.transferCall.backendError';
    expect(ToastCallError.toast).toHaveBeenCalledWith(i18nkey, 3000);
  });
});
