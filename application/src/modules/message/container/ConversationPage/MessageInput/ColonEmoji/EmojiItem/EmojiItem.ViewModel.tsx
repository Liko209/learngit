/*
 * @Author: ken.li
 * @Date: 2019-06-03 22:14:26
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { EmojiData } from 'emoji-mart';

class EmojiItemViewModel extends StoreViewModel<EmojiData> {
  constructor(props: EmojiData) {
    super(props);
  }

  @computed
  get person() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, 3);
  }
}

export { EmojiItemViewModel };
