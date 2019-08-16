/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework/ioc';
import { computed } from 'mobx';
import { DialerKeypadHeaderProps, DialerKeypadHeaderViewProps } from './types';
import { TelephonyStore } from '../../store';

class DialerKeypadHeaderViewModel extends StoreViewModel<DialerKeypadHeaderProps>
  implements DialerKeypadHeaderViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  quitKeypad = () => this._telephonyStore.quitKeypad();
}

export { DialerKeypadHeaderViewModel };
