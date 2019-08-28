/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:47:23
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import { TelephonyStore } from '../../store';

class AskFirstViewModel extends StoreViewModel<Props> {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  directToAskFirst = () => {};

  @computed
  get transferNumber() {
    return (
      this._telephonyStore.selectedCallItem.phoneNumber ||
      (this._isValidNumber ? this._telephonyStore.inputString : '')
    );
  }

  @computed
  private get _isValidNumber() {
    return this._telephonyStore.isValidInputStringNumber;
  }
}

export { AskFirstViewModel };
