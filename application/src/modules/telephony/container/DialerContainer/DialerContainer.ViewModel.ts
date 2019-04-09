/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { DialerContainerProps, DialerContainerViewProps } from './types';
import { container } from 'framework';
import { computed } from 'mobx';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';

class DialerContainerViewModel extends StoreViewModel<DialerContainerProps>
  implements DialerContainerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(TelephonyService);

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  dtmf = (digit: string) => this._telephonyService.dtmf(digit);
}

export { DialerContainerViewModel };
