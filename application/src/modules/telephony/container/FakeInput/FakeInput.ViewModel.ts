/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-09 13:41:55
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { FakeInputProps, FakeInputViewProps } from './types';
import { computed } from 'mobx';
import { container } from 'framework';
import { TelephonyStore } from '../../store';

class FakeInputViewModel extends StoreViewModel<FakeInputProps>
  implements FakeInputViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get enteredKeys() {
    return this._telephonyStore.enteredKeys;
  }
}

export { FakeInputViewModel };
