/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-18 13:57:22
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { MentionProps } from '../types';

class MentionItemViewModel extends StoreViewModel<MentionProps> {
  constructor(props: MentionProps) {
    super(props);
  }

  @computed
  get person() {
    const { id } = this.props;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
  }
}

export { MentionItemViewModel };
