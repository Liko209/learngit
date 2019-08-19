/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-29 09:49:37
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { TelephonyStore } from '../../store';
import {
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

class ReplyViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _intervalId?: NodeJS.Timeout;

  private _onActionSuccess = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.SUCCESS,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  };

  @observable
  shiftKeyStatus = false;

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  replyWithPattern = (
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => {
    this._telephonyService.replyWithPattern(pattern, time, timeUnit);
    if (
      (pattern === RTC_REPLY_MSG_PATTERN.IN_A_MEETING ||
        pattern === RTC_REPLY_MSG_PATTERN.ON_MY_WAY) &&
      !this.isOffline
    ) {
      this._onActionSuccess('telephony.prompt.ReplyMessageSuccess');
    }
  };

  replyWithMessage = () => {
    this._telephonyService.replyWithMessage(this.customReplyMessage);
  };

  startReply = () => {
    this._telephonyService.startReply();
  };

  quitReply = () => {
    this._telephonyStore.backIncoming();
  };

  storeCustomMessage = (message: string) => {
    this._telephonyStore.inputCustomReplyMessage(message);
  };

  setShiftKeyDown = (down: boolean) => {
    this.shiftKeyStatus = down;
  };

  @computed
  get customReplyMessage() {
    return this._telephonyStore.customReplyMessage;
  }

  @computed
  get replyCountdownTime() {
    return this._telephonyStore.replyCountdownTime || 0;
  }

  dispose = () => {
    this._intervalId && clearInterval(this._intervalId);
  };

  @computed
  get isExt() {
    return this._telephonyStore.isExt;
  }

  @computed
  get phone() {
    const phoneNumber = this._telephonyStore.phoneNumber;
    if (phoneNumber) {
      return formatPhoneNumber(phoneNumber);
    }
    return phoneNumber;
  }

  @computed
  get uid() {
    return this._telephonyStore.uid;
  }
  @computed
  get name() {
    return this._telephonyStore.displayName;
  }
}

export { ReplyViewModel };
