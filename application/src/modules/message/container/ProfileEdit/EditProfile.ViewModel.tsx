/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action, Reaction } from 'mobx';
import { AbstractViewModel } from '@/base';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';
import { trimStringBothSides, matchEmail } from '@/utils/string';
import { PersonService } from 'sdk/module/person';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import {
  EditProfileProps,
  EditProfileViewModelProps,
  EditItemSourceType,
} from './types';

class EditProfileViewModel extends AbstractViewModel<EditProfileProps>
  implements EditProfileViewModelProps {
  @observable firstName: string;
  @observable lastName: string;
  @observable title?: string;
  @observable location?: string;
  @observable webpage?: string;
  @observable webpageError: boolean;
  @observable currentPersonInfo: PersonModel;

  constructor(props: EditProfileProps) {
    super(props);
    this.reaction(
      () => this.person,
      (person: PersonModel, reaction: Reaction) => {
        const { firstName, lastName, homepage, location, jobTitle } = person;
        this.currentPersonInfo = person;
        this.firstName = firstName;
        this.lastName = lastName;
        this.title = jobTitle;
        this.location = location;
        this.webpage = homepage;
        reaction.dispose();
      },
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  get person() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.props.id);
  }

  getUpdateInfo = () => {
    const info = {
      firstName: this.firstName,
      lastName: this.lastName,
      jobTitle: this.title,
      location: this.location,
      homepage: this.webpage,
    };
    Object.keys(info).forEach(v => {
      if (info[v] === this.currentPersonInfo[v]) {
        delete info[v];
      }
    });
    return Object.keys(info).length ? info : undefined;
  };

  @action
  handleProfileEdit = async () => {
    if (this.webpage) {
      this.webpageError = !matchEmail(this.webpage);
    }
    console.log('looper', this.webpageError);
    if (this.webpageError) return;
    const info = this.getUpdateInfo();
    if (!info) return;
    console.log('looper', info);
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    await personService.editPersonalInfo(info);
  };

  @action
  updateInfo = (key: EditItemSourceType['key'], value: string) => {
    console.log('looper', key, value, trimStringBothSides(value));
    this[key] = trimStringBothSides(value);
  };
}

export { EditProfileViewModel };
