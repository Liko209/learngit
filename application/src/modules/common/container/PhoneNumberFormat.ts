/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-27 10:01:10
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { isValidPhoneNumber } from '@/common/postParser/utils';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import PhoneNumberModel from '@/store/models/PhoneNumber';

function formatPhoneNumberWithStore(phoneNumber: string) {
  return getEntity<PhoneNumber, PhoneNumberModel, string>(
    ENTITY_NAME.PHONE_NUMBER,
    phoneNumber,
  ).formattedPhoneNumber;
}

function formatPhoneNumber(phoneNumber: string, shouldValidate = true) {
  if (!shouldValidate) {
    return formatPhoneNumberWithStore(phoneNumber);
  }
  if (isValidPhoneNumber(phoneNumber)) {
    return formatPhoneNumberWithStore(phoneNumber);
  }
  return phoneNumber;
}
export { formatPhoneNumber };
