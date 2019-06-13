/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 14:20:09
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PhoneNumberModel from '@/store/models/PhoneNumber';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { LazyFormatPhoneProps } from './types';

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
    return getEntity<PhoneNumber, PhoneNumberModel, string>(
      ENTITY_NAME.PHONE_NUMBER,
      this.props.value,
    ).formattedPhoneNumber;
  }
}
