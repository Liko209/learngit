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
import { mainLogger } from 'sdk';

class ToastCallError {
  static toast(message: string, duration: number): void {
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
    mainLogger.info('Call error: Call timeout');
  }

  static toastFailedToRecord(): void {
    ToastCallError.toast('telephony.prompt.FailedToRecord', 2000);
    mainLogger.info('Call error: Call timeout');
  }

  static toastFailedToStopRecording(): void {
    ToastCallError.toast('telephony.prompt.FailedToStopRecording', 2000);
    mainLogger.info('Call error: Call timeout');
  }

  static toastLackOfRecordingPermission(): void {
    ToastCallError.toast('telephony.prompt.LackOfRecordingPermission', 2000);
    mainLogger.info('Call error: Call timeout');
  }

  static toastRecordOnServiceWeb(): void {
    ToastCallError.toast('telephony.prompt.RecordOnServiceWeb', 2000);
    mainLogger.info('Call error: Call timeout');
  }

  static toastRecordAutomatically(): void {
    ToastCallError.toast('telephony.prompt.RecordAutomatically', 2000);
    mainLogger.info('Call error: Call timeout');
  }
}

export { ToastCallError };
