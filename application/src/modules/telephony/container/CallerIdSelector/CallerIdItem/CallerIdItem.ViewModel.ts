/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:14:53
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { CallerIdItemProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PhoneNumberModel from '@/store/models/PhoneNumber';
import { PhoneNumber, PhoneNumberType } from 'sdk/module/phoneNumber/entity';

export class CallerIdItemViewModel extends StoreViewModel<CallerIdItemProps> {
  @computed
  get formattedPhoneNumber() {
    return getEntity<PhoneNumber, PhoneNumberModel, string>(
      ENTITY_NAME.PHONE_NUMBER,
      this.props.phoneNumber,
    ).formattedPhoneNumber;
  }

  @computed
  get isTwoLine() {
    return this.props.usageType !== PhoneNumberType.Blocked;
  }
}
