/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 14:20:09
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { LazyFormatPhoneProps } from './types';
import { formatPhoneNumber } from '../helpers';

export class LazyFormatPhoneViewModel extends StoreViewModel<
  LazyFormatPhoneProps
> {
  @observable
  _mounted = false;

  @action
  onAfterRender = () => {
    this._mounted = true;
  }

  @computed
  get formattedPhoneNumber() {
    if (!this._mounted) {
      return this.props.value;
    }
    return formatPhoneNumber(this.props.value);
  }
}
