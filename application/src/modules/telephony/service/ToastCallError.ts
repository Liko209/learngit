/*
 * @Author: Peng Yu
 * @Date: 2019-03-13 13:21:24
 * Copyright © RingCentral. All rights reserved.
 */
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { mainLogger } from 'foundation/log';
import i18next from 'i18next';

class ToastCallError {
  static toast(msg: string, duration: number): void {
    const message = i18next.t(msg);
    Notification.flagToast({
      message,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      autoHideDuration: duration,
      fullWidth: false,
      dismissible: false,
    });
  }

  static toastNoNetwork(): void {
    ToastCallError.toast('telephony.prompt.NoNetwork', 3000);
    mainLogger.info("Call error: No network, can't make call");
  }

  static toastCallFailed(): void {
    ToastCallError.toast('telephony.prompt.CallFailed', 2000);
    mainLogger.info('Call error: Call failed');
  }

  static toastCallTimeout(): void {
    ToastCallError.toast('telephony.prompt.CallTimeout', 2000);
    mainLogger.info('Call error: Call timeout');
  }
  static toastFailedToHold(): void {
    ToastCallError.toast('telephony.prompt.FailedToHold', 2000);
    mainLogger.info('Call error: Call timeout');
  }
  static toastFailedToResume(): void {
    ToastCallError.toast('telephony.prompt.FailedToResume', 2000);
    mainLogger.info('Call error: Call FailedToHold');
  }

  static toastFailedToRecord(): void {
    ToastCallError.toast('telephony.prompt.FailedToRecord', 2000);
    mainLogger.info('Call error: Call timeout');
  }

  static toastFailedToStopRecording(): void {
    ToastCallError.toast('telephony.prompt.FailedToStopRecording', 2000);
    mainLogger.info('Call error: Call FailedToRecord');
  }

  static toastLackOfRecordingPermission(): void {
    ToastCallError.toast('telephony.prompt.LackOfRecordingPermission', 2000);
    mainLogger.info('Call error: Call LackOfRecordingPermission');
  }

  static toastRecordOnServiceWeb(): void {
    ToastCallError.toast('telephony.prompt.RecordOnServiceWeb', 2000);
    mainLogger.info('Call error: Call RecordOnServiceWeb');
  }

  static toastRecordAutomatically(): void {
    ToastCallError.toast('telephony.prompt.RecordAutomatically', 2000);
    mainLogger.info('Call error: Call RecordAutomatically');
  }

  static toastEmptyReplyMessage(): void {
    ToastCallError.toast('telephony.prompt.ReplyCustomMessageEmpty', 3000);
    mainLogger.info(
      'Call error: incoming call reply with custom message is empty',
    );
  }

  static toastInvalidNumber(): void {
    ToastCallError.toast('telephony.prompt.InvalidNumber', 3000);
    mainLogger.info('Call error: Call timeout');
  }

  static toastParkErrorStopRecording(): void {
    ToastCallError.toast('telephony.prompt.ParkErrorStopRecording', 3000);
    mainLogger.info('Call error: your call recording is being saved.');
  }

  static toastParkError(): void {
    ToastCallError.toast('telephony.prompt.ParkError', 3000);
    mainLogger.info(
      "Call error: something went wrong on our end and we weren't able to park the call.",
    );
  }

  static toastPermissionError(): void {
    ToastCallError.toast('telephony.prompt.NoCallPermission', 3000);
    mainLogger.info(
      'Call error: You no longer have the permission to make the call.',
    );
  }

  static toastCountryBlockError(): void {
    ToastCallError.toast('telephony.prompt.CountryBlock', 3000);
    mainLogger.info('Call error: VoIP is not available in your country.');
  }

  static toastVoipUnavailableError(): void {
    ToastCallError.toast('telephony.prompt.VoipUnavailable', 3000);
    mainLogger.info('Call error: VoIP is currently not available.');
  }

  static toastOnDemandRecording() {
    ToastCallError.toast('telephony.prompt.OnDemandRecording', 3000);
    mainLogger.info(
      'Call error: On-demand call recording disabled in Service Web.',
    );
  }

  static toastAutoRecording() {
    ToastCallError.toast('telephony.prompt.AutoRecording', 3000);
    mainLogger.info(
      'Call error: Automatic call recording enabled in Service Web.',
    );
  }

  static toastSwitchCallNoNetwork(): void {
    ToastCallError.toast('telephony.prompt.switchCall.noNetwork', 3000);
    mainLogger.info("Call error: Network disconnection, can't switch call");
  }

  static toastSwitchCallBackendError(): void {
    ToastCallError.toast('telephony.prompt.switchCall.backendError', 3000);
    mainLogger.info("Call error: Unexpected backend error, can't switch call");
  }

  static toastTransferError(): void {
    ToastCallError.toast('telephony.prompt.transferCall.backendError', 3000);
    mainLogger.info(
      "Call error: Unexpected backend error, can't transfer call",
    );
  }
}

export { ToastCallError };
