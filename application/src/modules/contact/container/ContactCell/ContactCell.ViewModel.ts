/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:18
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity, getGlobalValue } from '@/store/utils';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { GLOBAL_KEYS } from '@/store/constants';

import { ContactCellProps } from './types';

class ContactCellViewModel extends StoreViewModel<ContactCellProps> {
  @computed
  get person() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.props.id);
  }

  @computed
  get isGuest() {
    return (
      this.person.companyId !== getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID)
    );
  }

  @computed
  get phoneNumber() {
    const phoneNumbers = this.person.phoneNumbers;
    return (
      phoneNumbers && phoneNumbers.length > 0 && phoneNumbers[0].phoneNumber
    );
  }

  @computed
  get displayName() {
    return this.person.userDisplayName;
  }
}

export { ContactCellViewModel };
