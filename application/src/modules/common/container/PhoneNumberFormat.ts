/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-27 10:01:10
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { isValidPhoneNumber } from '@/common/postParser/utils';

function formatPhoneNumber(phoneNumber: string) {
  if (isValidPhoneNumber(phoneNumber)) {
    return getEntity(ENTITY_NAME.PHONE_NUMBER, phoneNumber)
      .formattedPhoneNumber;
  }
  return phoneNumber;
}
export { formatPhoneNumber };
