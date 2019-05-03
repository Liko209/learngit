/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-22 14:16:11
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework';
import { computed } from 'mobx';
import { Props, ViewProps } from './types';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { CALL_STATE, CALL_WINDOW_STATUS } from '../../FSM';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class DialpadViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  maximize = () => {
    this._telephonyService.maximize();
  }

  @computed
  private get _callState() {
    return this._telephonyStore.callState;
  }

  @computed
  private get _callWindowState() {
    return this._telephonyStore.callWindowState;
  }

  @computed
  get showMinimized() {
    return (
      (this._callState === CALL_STATE.CONNECTING ||
        this._callState === CALL_STATE.CONNECTED) &&
      this._callWindowState === CALL_WINDOW_STATUS.MINIMIZED
    );
  }
}

export { DialpadViewModel };
