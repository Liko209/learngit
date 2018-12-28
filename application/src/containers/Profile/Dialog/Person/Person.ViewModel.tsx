/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ProfileDialogPersonProps,
  ProfileDialogPersonViewProps,
} from './types';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';

class ProfileDialogPersonViewModel
  extends AbstractViewModel<ProfileDialogPersonProps>
  implements ProfileDialogPersonViewProps {
  @computed
  get id() {
    return this.props.id; // person id
  }

  @computed
  get person() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.id);
  }

  dismiss() {
    this.props.dismiss();
  }
}

export { ProfileDialogPersonViewModel };
