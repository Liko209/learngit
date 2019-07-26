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
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

class MentionItemViewModel extends StoreViewModel<MentionProps> {
  constructor(props: MentionProps) {
    super(props);
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get isTeam() {
    return GlipTypeUtil.extractTypeId(this.id) === TypeDictionary.TYPE_ID_TEAM;
  }

  @computed
  get item() {
    if (GlipTypeUtil.extractTypeId(this.id) === TypeDictionary.TYPE_ID_TEAM) {
      return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
    }
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.id);
  }
}

export { MentionItemViewModel };
