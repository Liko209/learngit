/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-14 16:00:49
 * Copyright © RingCentral. All rights reserved.
 */
import { Person } from 'sdk/module/person/entity';
import { PersonService } from 'sdk/module/person';

export const getName = (item: Person) => {
  const personService = PersonService.getInstance() as PersonService;
  return personService.getFullName(item);
};
