/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-30 13:55:51
 * Copyright © RingCentral. All rights reserved.
 */

// import { computed } from 'mobx';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { TelephonyStore } from '../../store';
import { container } from 'framework/ioc';
import { Notification } from '@/containers/Notification';
import { catchError } from '@/common/catchError';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ToastCallError } from '../../service/ToastCallError';

class ForwardViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get<TelephonyService>(
    TELEPHONY_SERVICE,
  );

  private _onActionSuccess = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.SUCCESS,
      messageAlign: ToastMessageAlign.CENTER,
      fullWidth: false,
      dismissible: false,
    });
  };

  makeForwardCall = () => {
    this.forward(this._telephonyStore.forwardString);
  };

  @catchError.flash({
    server: 'telephony.prompt.ForwardBackendError',
  })
  forward = async (val: string) => {
    const { isValid } = await this._telephonyService.isValidNumber(val);
    if (!isValid) {
      ToastCallError.toastInvalidNumber();
      return false;
    }
    await this._telephonyService.forward(val);
    this._onActionSuccess('telephony.prompt.ForwardCallSuccess');
    return true;
  };

  quitForward = () => {
    this._telephonyStore.backIncoming();
  };
}

export { ForwardViewModel };
