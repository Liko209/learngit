/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager, AccountDao, ACCOUNT_USER_ID } from '../../dao';
import PersonDao from '../../dao/person';
import { transform, baseHandleData } from '../../service/utils';
import { ENTITY, SERVICE } from '../../service/eventKey';
import { Person } from '../../module/person/entity';
import { Raw } from '../../framework/model';
import notificationCenter from '../notificationCenter';

const handleTeamRemovedIds = async (people: any[]) => {
  const accountDao = daoManager.getKVDao(AccountDao);
  const userId: Number = Number(accountDao.get(ACCOUNT_USER_ID));
  if (userId) {
    let ids: number[] = [];
    people.some((person: Person) => {
      if (person.id === userId) {
        if (
          person.teams_removed_from &&
          person.teams_removed_from.length !== 0
        ) {
          ids = ids.concat(person.teams_removed_from);
        }
        return true;
      }
      return false;
    });
    ids.length &&
      notificationCenter.emit(SERVICE.PERSON_SERVICE.TEAMS_REMOVED_FORM, ids);
  }
};
const personHandleData = async (persons: Raw<Person>[]) => {
  if (persons.length === 0) {
    return;
  }
  const personDao = daoManager.getDao(PersonDao);
  const transformedData = persons.map(item => transform(item));
  handleTeamRemovedIds(transformedData);
  await baseHandleData({
    data: transformedData,
    dao: personDao,
    eventKey: ENTITY.PERSON,
  });
};

export default personHandleData;
