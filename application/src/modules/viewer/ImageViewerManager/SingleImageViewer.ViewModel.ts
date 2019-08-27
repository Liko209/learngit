/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { IViewerView } from '@/modules/viewer/container/ViewerView/interface';
import { PersonService } from 'sdk/module/person';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SingleImageViewerViewModuleProps } from './types';

const IMAGE_SIZE = 2000;
class SingleImageViewerViewModel
  extends AbstractViewModel<SingleImageViewerViewModuleProps>
  implements IViewerView {
  @observable _personId: number;
  @observable _dismiss: Function;
  @observable _person: PersonModel;

  constructor(personId: number, dismiss: Function) {
    super();
    this._personId = personId;
    this._dismiss = dismiss;
    this._person = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, personId);
  }

  @computed
  get hasPrevious() {
    return false;
  }

  @computed
  get hasNext() {
    return false;
  }

  viewerDestroyer() {
    this._dismiss();
  }

  @computed
  get pages() {
    let url;
    if (this._person && this._person.hasHeadShot && this._personId) {
      const { headshotVersion, headshot = '' } = this._person;
      const personService = ServiceLoader.getInstance<PersonService>(
        ServiceConfig.PERSON_SERVICE,
      );
      url = personService.getHeadShotWithSize(
        this._personId,
        headshot,
        IMAGE_SIZE,
        headshotVersion,
      );
    }
    return [
      {
        url: url || '',
        viewport: {
          origHeight: 0,
          origWidth: 0,
        },
      },
    ];
  }

  @computed
  get title() {
    const { displayName } = this._person;
    return {
      displayName,
    };
  }

  @computed
  get currentPageIdx() {
    return 0;
  }

  @computed
  get currentScale() {
    return 0;
  }

  @action
  onUpdate = () => {};
}

export { SingleImageViewerViewModel };
