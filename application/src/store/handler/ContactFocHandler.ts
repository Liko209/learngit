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
import { IdModel } from 'sdk/framework/model';

type DisplayNameModel = IdModel & {
  displayName: string;
};
class ContactFocHandler extends IdModelFocHandler {
  private _personService: PersonService;

  constructor() {
    super();
    this._personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
  }

  transformFunc = (
    model: Person,
  ): ISortableModelWithData<DisplayNameModel> => ({
    id: model.id,
    sortValue: model.id,
    data: {
      id: model.id,
      displayName: this._personService.getFullName(model).toLowerCase(),
    },
  });

  sortFunc = (
    lhs: ISortableModelWithData<DisplayNameModel>,
    rhs: ISortableModelWithData<DisplayNameModel>,
  ): number => {
    return SortUtils.compareLowerCaseString(
      lhs.data!.displayName,
      rhs.data!.displayName,
    );
  };

  filterFunc = (person: Person) => {
    return this._personService.isVisiblePerson(person);
  };

  protected createFoc() {
    return IdModelFocBuilder.buildFoc(
      this._personService.getEntitySource(),
      this.transformFunc,
      this.filterFunc,
      this.sortFunc,
    );
  }
}

export { ContactFocHandler };
