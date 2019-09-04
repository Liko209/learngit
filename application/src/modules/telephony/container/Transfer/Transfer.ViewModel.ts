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
import { TRANSFER_TYPE } from 'sdk/module/telephony/types';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { analyticsCollector } from '@/AnalyticsCollector';
import { CALL_STATE } from 'sdk/module/telephony/entity';

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
    this._telephonyStore.processTransfer();
    const res = await this._telephonyService.transfer(
      TRANSFER_TYPE.BLIND_TRANSFER,
      this.transferNumber,
    );
    this._telephonyStore.completeTransfer();
    res &&
      this._onActionSuccess('telephony.prompt.transferCall.transferSuccess');
  };

  completeTransfer = async () => {
    analyticsCollector.completeTransfer();
    this._telephonyStore.switchCurrentCall(this._transferCallId);
    const res = await this._telephonyService.transfer(
      TRANSFER_TYPE.WARM_TRANSFER,
      this._transferCallUuid,
    );
    if (res) {
      this._telephonyStore.leaveWarmTransferPage();
      this._onActionSuccess('telephony.prompt.transferCall.transferSuccess');
    }
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

  @computed
  get isWarmTransferPage() {
    return this._telephonyStore.isWarmTransferPage;
  }

  @computed
  get isMultipleCall() {
    return this._telephonyStore.isMultipleCall;
  }

  @computed
  private get _canCompleteTransfer() {
    return this._telephonyStore.canCompleteTransfer;
  }

  @computed
  get isTransferCallConnected() {
    return this.isMultipleCall
      ? this._telephonyStore.rawCalls[0].callState === CALL_STATE.CONNECTED &&
          this._canCompleteTransfer
      : false;
  }

  @computed
  private get _transferCallUuid() {
    return this._telephonyStore.rawCalls[1].uuid;
  }

  @computed
  private get _transferCallId() {
    return this._telephonyStore.rawCalls[0].id;
  }
}

export { TransferViewModel };
