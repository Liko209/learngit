/*
 * @Author: Spike.Yang
 * @Date: 2019-08-28 20:05:59
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import i18next from 'i18next';
import { formatSeconds } from '@/utils/date';

interface TelephonyTimeStore {
  time: string;
}

class TelephonyTimeStore {
  @observable
  private _seconds = 0;

  @observable
  private _connectTime = 0;

  constructor(connectTime: number) {
    this._connectTime = connectTime;
  }

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

  @action
  private _createInterval() {
    const { _connectTime } = this;
    if (_connectTime) {
      this._intervalId = setInterval(() => {
        this._seconds = Number(`${Date.now() - _connectTime}`.slice(0, -3));
      }, 1000);
    }
  }

  @computed
  get timing() {
    const { _connectTime } = this;
    if (!_connectTime) {
      return i18next.t('common.Connecting');
    }
    if (!this._intervalId) {
      this._createInterval();
      this._seconds = Number(`${Date.now() - _connectTime}`.slice(0, -3));
    }
    return this._timing;
  }
}

export { TelephonyTimeStore };
