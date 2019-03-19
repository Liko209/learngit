/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-18 10:24:09
 * Copyright © RingCentral. All rights reserved.
 */
import { ENTITY_NAME } from '@/store';
import { ENTITY } from 'sdk/service/eventKey';
import { IEntityDataProvider } from '../base/fetch/types';
import { Person } from 'sdk/module/person/entity';
import { PersonService } from 'sdk/module/person';
import PersonModel from '../models/Person';

import { IdListPaginationHandler } from './IdListPagingHandler';

class PersonProvider implements IEntityDataProvider<Person> {
  async getByIds(ids: number[]) {
    const personService: PersonService = PersonService.getInstance();
    const persons = await personService.getPersonsByIds(ids);
    return persons;
  }
}

class DiscontinuousPersonListHandler extends IdListPaginationHandler<
  Person,
  PersonModel
> {
  constructor(sourceIds: number[]) {
    const filterFunc = (person: PersonModel) => {
      return !person.deactivated;
    };

    const isMatchFunc = (person: Person) => {
      return this._sourceIds.includes(person.id) && !person.deactivated;
    };

    const options = {
      filterFunc,
      isMatchFunc,
      eventName: ENTITY.PERSON,
      entityName: ENTITY_NAME.PERSON,
      entityDataProvider: new PersonProvider(),
    };

    super(sourceIds, options);
  }
}

export { DiscontinuousPersonListHandler };
