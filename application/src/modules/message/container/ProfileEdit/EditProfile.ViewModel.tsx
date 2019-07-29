/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action, Reaction } from 'mobx';
import { catchError } from '@/common/catchError';
import { AbstractViewModel } from '@/base';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';
import { trimStringBothSides } from '@/utils/string';
import { PersonService } from 'sdk/module/person';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Markdown } from 'glipdown';
import portalManager from '@/common/PortalManager';
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
  @observable isLoading: boolean;

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

  @catchError.flash({
    network: 'people.profile.edit.editProfileNetworkError',
    server: 'people.profile.edit.editProfileBackendError',
  })
  @action
  handleProfileEdit = async () => {
    if (this.webpage) {
      this.webpageError = !new RegExp(Markdown.global_url_regex).test(
        this.webpage,
      );
    }
    if (this.webpageError) return;
    const info = this.getUpdateInfo();
    if (!info) {
      portalManager.dismissAll();
      return;
    }
    this.isLoading = true;
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    await personService.editPersonalInfo(info).catch(e => {
      this.isLoading = false;
      throw e;
    });
    this.isLoading && portalManager.dismissLast();
    this.isLoading = false;
  };

  @action
  updateInfo = (key: EditItemSourceType['key'], value: string) => {
    if (key === 'webpage') {
      this.webpageError = false;
    }
    if (key === 'firstName' || key === 'lastName') {
      value = value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, '');
    }
    this[key] = trimStringBothSides(value);
  };
}

export { EditProfileViewModel };
