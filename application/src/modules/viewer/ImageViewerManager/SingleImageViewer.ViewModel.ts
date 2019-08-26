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
import { SingleImageViewerViewModuleProps } from './types';

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

  @action
  switchToPrevious = () => {};

  @action
  switchToNext = () => {};

  @computed
  get pages() {
    let url = '';
    const { headshot = '' } = this._person;
    if (typeof headshot === 'string') {
      url = headshot;
    } else {
      url = headshot.url;
    }
    return [
      {
        url,
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
    const page = this.pages[0];
    return {
      downloadUrl: page.url,
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
