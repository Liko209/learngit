/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:14:53
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { CallerIdItemProps } from './types';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import { formatPhoneNumber } from '../helpers';

export class CallerIdItemViewModel extends StoreViewModel<CallerIdItemProps> {
  @computed
  get formattedPhoneNumber() {
    return formatPhoneNumber(this.props.phoneNumber);
  }

  @computed
  get isTwoLine() {
    return this.props.usageType !== PhoneNumberType.Blocked;
  }
}
