/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-25 10:00:13
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import { notificationCenter, SERVICE } from 'sdk/service';
import { ActiveCall } from 'sdk/module/rcEventSubscription/types';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { Dialog } from '@/containers/Dialog';
import { Notification } from '@/containers/Notification';
import i18next from 'i18next';
import { JuiModalProps } from 'jui/components/Dialog';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { getDisplayNameByCaller } from '@/modules/telephony/helpers';
import { analyticsCollector } from '@/AnalyticsCollector';

const CALL_SWITCH_TOP_HAT = 'Call switch top hat';
const CONFIRM_CALL_SWITCH = 'Call switch confirmation dialog';

class SwitchCallBannerViewModel extends StoreViewModel<Props> {
  @observable isShow: boolean;
  @observable callOnOtherDevice?: ActiveCall;
  @observable private _dialog: any;
  @observable displayName: string;

  private get _telephonyService(): TelephonyService {
    return container.get(TELEPHONY_SERVICE);
  }

  constructor(props: Props) {
    super(props);
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
      this._handleCallSwitch,
    );

    this.reaction(
      () => this.isShow,
      isShow => {
        if (isShow) {
          this._updateSwitchCall();
          return;
        }
        if (this._dialog && this.callOnOtherDevice) {
          this._dialog.dismiss();
          this.reset();
          this._toastCallEndBeforeConfirm(
            'telephony.prompt.switchCall.callEnded',
            this.displayName,
            3000,
          );
          return;
        }
        return;
      },
    );

    this.reaction(
      () => this.callOnOtherDevice,
      async (callOnOtherDevice: ActiveCall) => {
        if (callOnOtherDevice) {
          this.displayName = await getDisplayNameByCaller(callOnOtherDevice);
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  private _toastCallEndBeforeConfirm = (
    msg: string,
    displayName: string,
    duration: number,
  ) => {
    const message = i18next.t(msg, { displayName });
    Notification.flagToast({
      message,
      type: ToastType.INFO,
      messageAlign: ToastMessageAlign.LEFT,
      autoHideDuration: duration,
      fullWidth: false,
      dismissible: false,
    });
  };

  @action
  private _handleCallSwitch = (isShow: boolean) => {
    this.isShow = isShow;
  };

  @action
  openCallSwitch = (data: JuiModalProps) => {
    analyticsCollector.openCallSwitch(CALL_SWITCH_TOP_HAT);
    this._dialog = Dialog.confirm(data);
  };

  @action
  private _updateSwitchCall = async () => {
    this.callOnOtherDevice = await this._telephonyService.getSwitchCall();
  };

  @action
  switchCall = async () => {
    await this._updateSwitchCall();
    if (this.callOnOtherDevice) {
      analyticsCollector.confirmCallSwitch(CONFIRM_CALL_SWITCH);
      const result = await this._telephonyService.switchCall(
        this.callOnOtherDevice,
      );
      if (result) {
        this.reset();
      }
      return;
    }
    return;
  };

  @action
  reset = () => {
    this.callOnOtherDevice = undefined;
    this._dialog = null;
  };

  dispose = () => {
    notificationCenter.off(
      SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
      this._handleCallSwitch,
    );
  };
}

export { SwitchCallBannerViewModel };
