/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Props } from '../types';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

class PersonItemViewModel extends StoreViewModel<Props> {
  constructor(props: Props) {
    super(props);
    const { sectionIndex, cellIndex } = props;
    this.reaction(
      () => this.person,
      () => this.props.didChange(sectionIndex, cellIndex),
    );
  }

  @computed
  get person() {
    const { id } = this.props;
    console.log(id, '-----nello id');
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
  }
}

export { PersonItemViewModel };
