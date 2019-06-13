/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 14:20:09
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { LazyFormatPhoneProps } from './types';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import { container } from 'framework';
import { TelephonyStore } from '../../../store';

export class LazyFormatPhoneViewModel extends StoreViewModel<
  LazyFormatPhoneProps
> {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get formattedPhoneNumber() {
    if (!this._telephonyStore.enteredDialer) {
      return this.props.value;
    }
    return formatPhoneNumber(this.props.value, false);
  }
}
