/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import PersonDao from '../../dao/person';
import { transform, baseHandleData } from '../../service/utils';
import { ENTITY } from '../../service/eventKey';
import { Person, Raw } from '../../models';

const personHandleData = async (persons: Raw<Person>[]) => {
  if (persons.length === 0) {
    return;
  }
  const personDao = daoManager.getDao(PersonDao);
  const transformedData = persons.map(item => transform(item));
  await baseHandleData({
    data: transformedData,
    dao: personDao,
    eventKey: ENTITY.PERSON,
  });
};

export default personHandleData;
