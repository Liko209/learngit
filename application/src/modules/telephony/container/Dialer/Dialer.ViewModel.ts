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

  @computed
  get callState() {
    return this._telephonyStore.callState;
  }
}

export { DialerViewModel };
