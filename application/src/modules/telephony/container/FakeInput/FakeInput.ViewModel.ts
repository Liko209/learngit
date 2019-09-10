/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-09 13:41:55
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { FakeInputProps, FakeInputViewProps } from './types';
import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';

class FakeInputViewModel extends StoreViewModel<FakeInputProps>
  implements FakeInputViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  // Perf: this is the fastest solution by using js-bench in node.V10.15.0
  static reverse(str: string) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
      reversed += str[i];
    }
    return reversed;
  }

  @computed
  get enteredKeys() {
    return FakeInputViewModel.reverse(this._telephonyStore.enteredKeys);
  }

  @computed
  get showCursor() {
    return this._telephonyStore.dialerFocused;
  }
}

export { FakeInputViewModel };
