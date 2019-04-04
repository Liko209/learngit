/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { HoldProps, HoldViewProps } from './types';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { computed } from 'mobx';
import { mainLogger } from 'sdk';
import {
  HOLD_STATE,
} from '../../FSM';
class HoldViewModel extends StoreViewModel<HoldProps> implements HoldViewProps {
  private _telephonyService: TelephonyService = container.get(TelephonyService);
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get disabled() {
    return this._telephonyStore.holdState === HOLD_STATE.DISABLED;
  }

  @computed
  get held() {
    return this._telephonyStore.holdState === HOLD_STATE.HOLDED;
  }

  get isOnline() {
    return window.navigator.onLine;
  }

  handleClick = () => {
    if (!this.isOnline) {
      mainLogger.debug(
        `${TelephonyService.TAG}[TELEPHONY_HOLD_BUTTON_PENDING_STATE]: ${this._telephonyStore.pendingForHold}`,
      );
      mainLogger.debug(
        `${TelephonyService.TAG}[TELEPHONY_HOLD_BUTTON_DISABLE_STATE]: ${this.disabled}`,
      );
      return;
    }

    mainLogger.debug(
      `${TelephonyService.TAG}[TELEPHONY_HOLD_BUTTON_PENDING_STATE]: ${this._telephonyStore.pendingForHold}`,
    );

    this._telephonyService.holdOrUnhold();
  }
}

export { HoldViewModel };
