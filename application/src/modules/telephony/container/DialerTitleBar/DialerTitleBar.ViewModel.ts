/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import i18next from 'i18next';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { formatSeconds } from '@/utils/date';
import { DialerTitleBarProps } from './types';
import { TelephonyStore, INCOMING_STATE } from '../../store';

class DetachOrAttachViewModel extends StoreViewModel<DialerTitleBarProps> {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  constructor(props: DialerTitleBarProps) {
    super(props);
    this.reaction(
      () => this.isDialer,
      isDialer => {
        isDialer && this.dispose();
      },
    );
  }

  @observable
  private _seconds = 0;

  @computed
  private get _timing() {
    const { secondTime, hourTime, minuteTime } = formatSeconds(this._seconds);
    let result = `${minuteTime}:${secondTime}`;
    if (hourTime !== '00') {
      result = `${hourTime}:${result}`;
    }
    return result;
  }

  private _intervalId?: NodeJS.Timeout;

  @action.bound
  private _createInterval() {
    const { activeCallTime } = this._telephonyStore;
    if (activeCallTime) {
      this._intervalId = setInterval(() => {
        this._seconds = Number(`${Date.now() - activeCallTime}`.slice(0, -3));
      }, 1000);
    }
  }

  @computed
  get timing() {
    const { activeCallTime } = this._telephonyStore;
    if (!activeCallTime) {
      return i18next.t('common.Connecting');
    }
    if (!this._intervalId) {
      this._createInterval();
      this._seconds = Number(`${Date.now() - activeCallTime}`.slice(0, -3));
    }
    return this._timing;
  }

  @computed
  get isDialer() {
    return this._telephonyStore.shouldDisplayDialer;
  }

  @computed
  get isForward() {
    return this._telephonyStore.incomingState === INCOMING_STATE.FORWARD;
  }

  @computed
  get isTransfer() {
    return (
      this._telephonyStore.isTransferPage ||
      this._telephonyStore.isWarmTransferPage
    );
  }

  @computed
  get canCompleteTransfer() {
    return this._telephonyStore.canCompleteTransfer;
  }

  dispose = () => {
    this._intervalId && clearInterval(this._intervalId);
    this._intervalId = undefined;
  };
}

export { DetachOrAttachViewModel };
