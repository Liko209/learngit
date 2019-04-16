/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-08 17:22:37
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { Props } from './types';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

class ContactSearchItemViewModel extends StoreViewModel<Props> {
  @computed
  get person() {
    return getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      this.props.itemId,
    );
  }
}

export { ContactSearchItemViewModel };
