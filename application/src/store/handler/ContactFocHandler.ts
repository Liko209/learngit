/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 14:54:44
 * Copyright © RingCentral. All rights reserved.
 */

import { ISortableModelWithData } from '@/store/base';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import { Person } from 'sdk/module/person/entity';
import { SortUtils } from 'sdk/framework/utils';
import { IdModelFocHandler } from './IdModelFocHandler';
import { IdModelFocBuilder } from './IdModelFocBuilder';

class ContactFocHandler extends IdModelFocHandler {
  private _personService: PersonService;

  constructor() {
    super();
    this._personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
  }

  sortFunc = (
    lhs: ISortableModelWithData<Person>,
    rhs: ISortableModelWithData<Person>,
  ): number => {
    return SortUtils.compareString(
      this._personService.getFullName(lhs.data!),
      this._personService.getFullName(rhs.data!),
    );
  };

  filterFunc = (person: Person) => {
    return this._personService.isVisiblePerson(person);
  };

  protected createFoc() {
    return IdModelFocBuilder.buildFoc(
      this._personService.getEntitySource(),
      this.filterFunc,
      this.sortFunc,
    );
  }
}

export { ContactFocHandler };
