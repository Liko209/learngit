/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-22 13:19:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Person } from '../entity';
import { daoManager } from '../../../dao';
import { PersonDao } from '../dao';
import { Raw } from '../../../framework/model';
import { AccountGlobalConfig } from '../../../service/account/config';
import { transform, baseHandleData } from '../../../service/utils';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE, ENTITY } from '../../../service/eventKey';

class PersonDataController {
  handleTeamRemovedIds = async (people: any[]) => {
    const userId: Number = AccountGlobalConfig.getInstance().getCurrentUserId();
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
        notificationCenter.emit(SERVICE.PERSON_SERVICE.TEAMS_REMOVED_FROM, ids);
    }
  }

  handleIncomingData = async (persons: Raw<Person>[]) => {
    if (persons.length === 0) {
      return;
    }
    const personDao = daoManager.getDao(PersonDao);
    const transformedData = persons.map(item => transform(item));
    this.handleTeamRemovedIds(transformedData);
    await baseHandleData({
      data: transformedData,
      dao: personDao,
      eventKey: ENTITY.PERSON,
    });
  }
}

export { PersonDataController };
