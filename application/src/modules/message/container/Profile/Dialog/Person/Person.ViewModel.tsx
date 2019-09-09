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
import { getEntity, getGlobalValue } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';
import { PersonService } from 'sdk/module/person';
import { GLOBAL_KEYS } from '@/store/constants';
import { generalErrorHandler } from '@/utils/error';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class ProfileDialogPersonViewModel
  extends AbstractViewModel<ProfileDialogPersonProps>
  implements ProfileDialogPersonViewProps {
  constructor(props: ProfileDialogPersonProps) {
    super(props);
    this.reaction(
      () => this.person.homepage,
      (homepage: string) => {
        if (!homepage) {
          this._refreshPersonData();
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  get id() {
    return this.props.id; // person id
  }

  @computed
  get person() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.id);
  }

  private _refreshPersonData = () => {
    try {
      const personService = ServiceLoader.getInstance<PersonService>(
        ServiceConfig.PERSON_SERVICE,
      );
      personService.refreshPersonData(this.id);
    } catch (err) {
      generalErrorHandler(err);
    }
  };

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @computed
  get isTheCurrentUserProfile() {
    return this.currentUserId === this.id;
  }
}

export { ProfileDialogPersonViewModel };
