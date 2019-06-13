/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:14:53
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PhoneNumberModel from '@/store/models/PhoneNumber';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';

export function formatPhoneNumber(val: string) {
  return getEntity<PhoneNumber, PhoneNumberModel, string>(
    ENTITY_NAME.PHONE_NUMBER,
    val,
  ).formattedPhoneNumber;
}
