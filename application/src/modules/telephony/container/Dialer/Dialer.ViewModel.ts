/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework';
import { computed } from 'mobx';
import { DialerProps, DialerViewProps } from './types';
import { TelephonyStore } from '../../store';

class DialerViewModel extends StoreViewModel<DialerProps>
  implements DialerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  dialerId = this._telephonyStore.dialerId;

  @computed
  get hasIncomingCall() {
    return this._telephonyStore.hasIncomingCall;
  }

  @computed
  get callWindowState() {
    return this._telephonyStore.callWindowState;
  }

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  @computed
  get startMinimizeAnimation() {
    return this._telephonyStore.startMinimizeAnimation;
  }

  @computed
  get dialerMinimizeTranslateX() {
    return this._telephonyStore.dialerMinimizeTranslateX;
  }

  @computed
  get dialerMinimizeTranslateY() {
    return this._telephonyStore.dialerMinimizeTranslateY;
  }
}

export { DialerViewModel };
