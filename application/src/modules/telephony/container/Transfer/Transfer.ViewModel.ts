/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:46:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { TRANSFER_TYPE } from 'sdk/module/telephony/entity/types';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { analyticsCollector } from '@/AnalyticsCollector';

const TRANSFER_NOW_ACTION = 'transferNow';

class TransferViewModel extends StoreViewModel<Props> {
  private _telephonyService: TelephonyService = container.get(
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
  };

  transferCall = async () => {
    analyticsCollector.clickTransferActions(TRANSFER_NOW_ACTION);
    const res = await this._telephonyService.transfer(
      TRANSFER_TYPE.BLIND_TRANSFER,
      this.transferNumber,
    );
    res && this._onActionSuccess('telephony.prompt.transferCall.transferSuccess');
  };

  @computed
  get transferNumber() {
    return (
      this._telephonyStore.selectedCallItem.phoneNumber ||
      (this._isValidNumber ? this._telephonyStore.inputString : '')
    );
  }

  @computed
  private get _isValidNumber() {
    return this._telephonyStore.isValidInputStringNumber;
  }
}

export { TransferViewModel };
