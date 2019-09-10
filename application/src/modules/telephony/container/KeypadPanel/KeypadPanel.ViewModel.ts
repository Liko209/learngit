/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { KeypadPanelProps, KeypadPanelViewProps } from './types';
import { container } from 'framework/ioc';
import { computed } from 'mobx';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class KeypadPanelViewModel extends StoreViewModel<KeypadPanelProps>
  implements KeypadPanelViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  @computed
  get canClickToInput() {
    return (
      this._telephonyStore.inputString.length <
      this._telephonyStore.maximumInputLength
    );
  }

  @computed
  get dialerFocused() {
    return (
      this._telephonyStore.dialerFocused && this._telephonyStore.keypadEntered
    );
  }

  dtmfThroughKeyboard = (digit: string) => {
    if (!this._telephonyStore.dialerFocused) {
      return;
    }
    this.dtmfThroughKeypad(digit);
  }

  dtmfThroughKeypad = (digit: string) => {
    this.playAudio(digit);
    this._telephonyService.dtmf(digit);
  }

  playAudio = (digit: string) => {
    if (!this.canClickToInput) {
      return;
    }
    this._telephonyService.playBeep(digit);
  }
}

export { KeypadPanelViewModel };
