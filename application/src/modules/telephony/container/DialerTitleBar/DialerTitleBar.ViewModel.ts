/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { formatSeconds } from '@/utils/date';
import { DialerTitleBarProps, DialerTitleBarViewProps } from './types';
import { TelephonyStore } from '../../store';
import { CALL_STATE } from '../../FSM';

class DetachOrAttachViewModel extends StoreViewModel<DialerTitleBarProps>
  implements DialerTitleBarViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

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
    this._intervalId = setInterval(() => {
      this._seconds = this._seconds + 1;
    },                             1000);
  }

  @computed
  get timing() {
    const { callState } = this._telephonyStore;
    if (callState === CALL_STATE.CONNECTING) {
      return 'Connecting';
    }
    if (!this._intervalId) {
      this._createInterval();
    }
    return this._timing;
  }
}

export { DetachOrAttachViewModel };
