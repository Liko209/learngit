/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { TelephonyService } from '../../../service';
import { Props, ViewProps, ForwardCall } from './types';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { Notification } from '@/containers/Notification';
import { defaultNotificationOptions } from '@/common/catchError';
import { errorHelper } from 'sdk/error';
import { generalErrorHandler } from '@/utils/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

class ForwardViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  directForward = () => {
    this._telephonyStore.directForward();
  }
  @observable
  forwardCalls: ForwardCall[];
  @observable
  shouldDisableForwardButton: boolean;
  constructor() {
    super();
    this._getForwardCalls();
    this._getForwardPermission();
  }

  private _onActionSuccess = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.SUCCESS,
      messageAlign: ToastMessageAlign.CENTER,
      fullWidth: false,
      dismissible: false,
    });
  }

  private _getForwardCalls = async () => {
    const list = await this._telephonyService.getForwardingNumberList();
    this.forwardCalls =
      list &&
      list.map(forwardCall => ({
        phoneNumber: forwardCall.phoneNumber,
        label: forwardCall.label,
      }));
  }
  forward = async (phoneNumber: string) => {
    try {
      await this._telephonyService.forward(phoneNumber);
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
  }

  private _getForwardPermission = async () => {
    this.shouldDisableForwardButton = !(await this._telephonyService.getForwardPermission());
  }
}

export { ForwardViewModel };
