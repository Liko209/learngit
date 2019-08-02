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
import { CALL_STATE } from 'sdk/module/telephony/entity';
import { analyticsCollector } from '@/AnalyticsCollector';

class DialerViewModel extends StoreViewModel<DialerProps>
  implements DialerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  dialerId = this._telephonyStore.dialerId;

  constructor(props: DialerProps) {
    super(props);
    this.reaction(
      () => this._telephonyStore.callState,
      callState => {
        if (callState === CALL_STATE.CONNECTING) {
          analyticsCollector.activeCall();
        }
      },
    );
  }

  @computed
  get isIncomingCall() {
    return this._telephonyStore.isIncomingCall;
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

  @computed
  get shouldDisplayDialer() {
    return this._telephonyStore.shouldDisplayDialer;
  }

  @computed
  private get _hasCall() {
    return !!this._telephonyStore.uuid;
  }

  @computed
  get shouldDisplayCallCtrl() {
    return this._hasCall && !this.keypadEntered;
  }
}

export { DialerViewModel };
