/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action, Reaction } from 'mobx';
import { catchError } from '@/common/catchError';
import { EMOJI_UNICODE_REGEX } from '@/common/postParser/utils';
import { AbstractViewModel } from '@/base';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { HeadShotInfo } from 'sdk/module/person/types';
import { ENTITY_NAME } from '@/store';
import { trimStringBothSides } from '@/utils/string';
import { PersonService } from 'sdk/module/person';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Markdown } from 'glipdown';
import portalManager from '@/common/PortalManager';
import { dataAnalysis } from 'foundation/analysis';
import {
  EditProfileProps,
  EditProfileViewModelProps,
  EditItemSourceType,
  LocalInfo,
} from './types';

class EditProfileViewModel extends AbstractViewModel<EditProfileProps>
  implements EditProfileViewModelProps {
  @observable firstName: string;
  @observable lastName: string;
  @observable jobTitle?: string;
  @observable location?: string;
  @observable homepage?: string;
  @observable homepageError: boolean;
  @observable currentPersonInfo: PersonModel;
  @observable isLoading: boolean;
  @observable headShotInfo: HeadShotInfo;
  @observable localInfo: LocalInfo;

  constructor(props: EditProfileProps) {
    super(props);
    this.reaction(
      () => this.person,
      (person: PersonModel, reaction: Reaction) => {
        const { firstName, lastName, homepage, location, jobTitle } = person;
        this.currentPersonInfo = person;
        this.firstName = firstName;
        this.lastName = lastName;
        this.jobTitle = jobTitle;
        this.location = location;
        this.homepage = homepage;
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

  @action
  getUpdateInfo = () => {
    const keyMaps = {
      firstName: 'first_name',
      lastName: 'last_name',
      jobTitle: 'job_title',
      location: 'location',
      homepage: 'homepage',
    };
    const info = {};
    Object.keys(keyMaps).forEach(key => {
      if (this[key] === undefined) return;
      this[key] = trimStringBothSides(this[key]);
      if (this[key] === this.currentPersonInfo[key]) {
        return;
      }
      info[keyMaps[key]] = this[key];
    });
    return Object.keys(info).length ? info : undefined;
  };

  @catchError.flash({
    network: 'people.profile.edit.editProfileNetworkError',
    server: 'people.profile.edit.editProfileBackendError',
  })
  @action
  handleProfileEdit = async () => {
    dataAnalysis.track('Jup_Web/DT_profile_saveEditAvatar', {
      source: 'Edit Profile',
    });
    if (this.homepage) {
      this.homepageError = !new RegExp(Markdown.global_url_regex).test(
        this.homepage,
      );
    }
    if (this.homepageError) return;
    const info = this.getUpdateInfo();
    if (!info && !this.headShotInfo) {
      portalManager.dismissAll();
      return;
    }
    this.isLoading = true;
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    await personService.editPersonalInfo(info, this.headShotInfo).catch(e => {
      this.isLoading = false;
      throw e;
    });
    this.isLoading && portalManager.dismissLast();
    this.isLoading = false;
  };

  @action
  updateInfo = (key: EditItemSourceType['key'], value: string) => {
    if (key === 'homepage') {
      this.homepageError = false;
    }
    if (key === 'firstName' || key === 'lastName') {
      value = value.replace(new RegExp(EMOJI_UNICODE_REGEX, 'gi'), '');
    }
    this[key] = value;
  };

  onPhotoEdited = (headShotInfo: HeadShotInfo, localInfo: LocalInfo) => {
    this.headShotInfo = headShotInfo;
    this.localInfo = localInfo;
  };
}

export { EditProfileViewModel };
