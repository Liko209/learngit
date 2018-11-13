/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Person } from 'sdk/models';
import PersonModel from '@/store/models/Person';

class TaskAvatarNameViewModel extends StoreViewModel<Props>
  implements ViewProps {
  @computed
  get id() {
    return this.props.id;
  }
  @computed
  get name() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.id)
      .displayName;
  }
}

export { TaskAvatarNameViewModel };
