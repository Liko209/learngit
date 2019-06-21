/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-03 18:03:24
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework';
import { TelephonyService } from '../../../service';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyStore } from '../../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { Notification } from '@/containers/Notification';
import { defaultNotificationOptions } from '@/common/catchError';
import { errorHelper } from 'sdk/error';
import { generalErrorHandler } from '@/utils/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ToastCallError } from '../../../service/ToastCallError';
// import { analyticsCollector } from '@/AnalyticsCollector';

// const ANALYTICS_SOURCE = 'dialer';

class ForwardBtnViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyService: TelephonyService = container.get<TelephonyService>(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  private _onActionSuccess = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.SUCCESS,
      messageAlign: ToastMessageAlign.CENTER,
      fullWidth: false,
      dismissible: false,
    });
  }
  forward = async () => {
    if (
      !this._telephonyService.isValidNumber(this._telephonyStore.forwardString)
    ) {
      return ToastCallError.toastInvalidNumber();
    }
    try {
      await this._telephonyService.forward(this._telephonyStore.forwardString);
      this._onActionSuccess('telephony.prompt.ForwardCallSuccess');
    } catch (error) {
      if (errorHelper.isBackEndError(error)) {
        Notification.flashToast({
          ...defaultNotificationOptions,
          message: 'telephony.prompt.ForwardBackendError',
        });
        return false;
      }
      generalErrorHandler(error);
    }
    return true;
    // this._telephonyStore.dialerCall();
    // this._trackCall(ANALYTICS_SOURCE);
  }

  // FIXME: remove this logic by exposing the phone parser from SDK to view-model layer
  // _makeCall = async (val: string) => {
  //   // make sure line 30 run before end()
  //   if (!(await this._telephonyService.makeCall(val))) {
  //     await new Promise(resolve => {
  //       requestAnimationFrame(resolve);
  //     });
  //     this._telephonyStore.end();
  //   }
  // }

  // private _trackCall = (analysisSource: string) => {
  //   analyticsCollector.makeOutboundCall(analysisSource);
  // }
}

export { ForwardBtnViewModel };
