/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Props } from './types';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

class PersonItemViewModel extends StoreViewModel<Props> {
  @computed
  get persons() {
    const ps = this.props.ids.map((id: number) => {
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
    });
    console.log(ps, '-----nello ps');
    return ps;
  }
}

export { PersonItemViewModel };
