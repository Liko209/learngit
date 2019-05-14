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
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';

const RADIUS = 32;

class DialerViewModel extends StoreViewModel<DialerProps>
  implements DialerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get<TelephonyService>(
    TELEPHONY_SERVICE,
  );
  private _animationPromise: Promise<any> | null = null;

  setAnimationPromise = (p: Promise<any>) => {
    if (this._animationPromise) {
      delete this._animationPromise;
    }
    this._animationPromise = p;
    Promise.resolve(this._animationPromise).then(
      this._telephonyService.onAnimationEnd,
    );
  }

  clearAnimationPromise = () => (this._animationPromise = null);

  dialerId = this._telephonyStore.dialerId;

  @computed
  get callState() {
    return this._telephonyStore.callState;
  }

  @computed
  get callWindowState() {
    return this._telephonyStore.callWindowState;
  }

  @computed
  get incomingState() {
    return this._telephonyStore.incomingState;
  }

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  @computed
  get shouldAnimationStart() {
    return this._telephonyStore.shouldAnimationStart;
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
  get xScale() {
    return `calc(${RADIUS} / ${this._telephonyStore.dialerWidth})`;
  }

  @computed
  get yScale() {
    return `calc(${RADIUS} / ${this._telephonyStore.dialerHeight})`;
  }
}

export { DialerViewModel };
