/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { VoiceMailProps, VoiceMailViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { TelephonyStore } from '../../store';
import { TRANSFER_TYPE } from 'sdk/module/telephony/types';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { analyticsCollector } from '@/AnalyticsCollector';

const SEND_VOICEMAIL_ACTION = 'sendToVoicemail';
class VoiceMailViewModel extends StoreViewModel<VoiceMailProps>
  implements VoiceMailViewProps {
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

  sendToVoiceMail = () => {
    this.isTransferPage
      ? this._transferVoiceMail()
      : this._telephonyService.sendToVoiceMail();
  };

  private _transferVoiceMail = async () => {
    analyticsCollector.clickTransferActions(SEND_VOICEMAIL_ACTION);
    const res = await this._telephonyService.transfer(
      TRANSFER_TYPE.TO_VOICEMAIL,
      this.transferNumber,
    );
    res &&
      this._onActionSuccess('telephony.prompt.transferCall.transferSuccess');
  };

  @computed
  get isTransferPage() {
    return this._telephonyStore.isTransferPage;
  }

  @computed
  get isIncomingCall() {
    return this._telephonyStore.isIncomingCall;
  }

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

export { VoiceMailViewModel };
