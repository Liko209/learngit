/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-22 13:19:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Person } from '../entity';
import { daoManager, DeactivatedDao } from '../../../dao';
import { Raw } from '../../../framework/model';
import { AccountGlobalConfig } from '../../../service/account/config';
import { transform } from '../../../service/utils';
import { shouldEmitNotification } from '../../../utils/notificationUtils';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE, ENTITY } from '../../../service/eventKey';
import { SYNC_SOURCE } from '../../../module/sync/types';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';

class PersonDataController {
  constructor(public entitySourceController: IEntitySourceController<Person>) {}

  handleTeamRemovedIds = async (people: any[]) => {
    const userId: Number = AccountGlobalConfig.getCurrentUserId();
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

  handleIncomingData = async (persons: Raw<Person>[], source: SYNC_SOURCE) => {
    if (persons.length === 0) {
      return;
    }
    const transformedData: Person[] = persons.map((item: Raw<Person>) =>
      transform(item),
    );
    this.handleTeamRemovedIds(transformedData);
    this._saveDataAndDoNotification(transformedData, source);
  }

  private _saveDataAndDoNotification(persons: Person[], source: SYNC_SOURCE) {
    const deactivatedData = persons.filter(
      (item: any) => item.deactivated === true,
    );

    const normalData = persons.filter((item: any) => item.deactivated !== true);

    this._saveData(deactivatedData, normalData);
    if (shouldEmitNotification(source)) {
      notificationCenter.emitEntityUpdate(ENTITY.PERSON, persons);
    }
  }

  private async _saveData(deactivatedData: Person[], normalData: Person[]) {
    if (deactivatedData.length > 0) {
      await daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData);
      await this.entitySourceController.bulkDelete(
        deactivatedData.map((item: any) => item.id),
      );
    }
    if (normalData.length > 0) {
      await this.entitySourceController.bulkPut(normalData);
    }
  }
}

export { PersonDataController };
