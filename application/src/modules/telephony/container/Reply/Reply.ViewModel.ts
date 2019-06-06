/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-29 09:49:37
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
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

class ReplyViewModel extends StoreViewModel<Props> {
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
  }

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
  }

  replyWithMessage = () => {
    this._telephonyService.replyWithMessage(this.customReplyMessage);
  }

  startReply = () => {
    this._telephonyService.startReply();
  }

  quitReply = () => {
    this._telephonyStore.backIncoming();
  }

  storeCustomMessage = (message: string) => {
    this._telephonyStore.inputCustomReplyMessage(message);
  }

  setShiftKeyDown = (down: boolean) => {
    this._telephonyStore.setShiftKeyDown(down);
  }

  @computed
  get shiftKeyDown(): boolean {
    return this._telephonyStore.shiftKeyDown;
  }

  @computed
  get customReplyMessage() {
    return this._telephonyStore.customReplyMessage;
  }

  @computed
  get replyCountdownTime() {
    return this._telephonyStore.replyCountdownTime;
  }

  dispose = () => {
    this._intervalId && clearInterval(this._intervalId);
    this.quitReply();
  }
}

export { ReplyViewModel };
