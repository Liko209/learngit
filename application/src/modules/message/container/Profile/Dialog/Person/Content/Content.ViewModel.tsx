/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ProfileDialogPersonContentViewProps } from './types';
import { ProfileDialogPersonViewModel } from '../Person.ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import CompanyModel from '@/store/models/Company';
import { Company } from 'sdk/module/company/entity';
import { ENTITY_NAME } from '@/store';
import { PhoneNumberInfo, PHONE_NUMBER_TYPE } from 'sdk/module/person/entity';
import { GLOBAL_KEYS } from '@/store/constants';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

class ProfileDialogPersonContentViewModel extends ProfileDialogPersonViewModel
  implements ProfileDialogPersonContentViewProps {
  @computed
  get company() {
    return getEntity<Company, CompanyModel>(
      ENTITY_NAME.COMPANY,
      this.person.companyId,
    );
  }

  @computed
  get _phoneNumbers() {
    return this.person.phoneNumbers;
  }

  @computed
  get extensionNumbers() {
    return this._phoneNumbers.filter((info: PhoneNumberInfo) => info.type === PHONE_NUMBER_TYPE.EXTENSION_NUMBER);
  }

  @computed
  get directNumbers() {
    const phoneNumbers = this._phoneNumbers.filter((info: PhoneNumberInfo) => info.type === PHONE_NUMBER_TYPE.DIRECT_NUMBER);
    phoneNumbers.forEach((item: PhoneNumberInfo) => {
      item.phoneNumber = formatPhoneNumber(item.phoneNumber);
    });
    return phoneNumbers;
  }

  @computed
  get isMe() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return this.id === currentUserId;
  }
}

export { ProfileDialogPersonContentViewModel };
