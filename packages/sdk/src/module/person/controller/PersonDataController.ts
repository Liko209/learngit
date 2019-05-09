/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-22 13:19:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Person } from '../entity';
import { daoManager, DeactivatedDao } from '../../../dao';
import { Raw } from '../../../framework/model';
import { AccountUserConfig } from '../../../module/account/config';
import { transform } from '../../../service/utils';
import { shouldEmitNotification } from '../../../utils/notificationUtils';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE, ENTITY } from '../../../service/eventKey';
import { SYNC_SOURCE, ChangeModel } from '../../../module/sync/types';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';

class PersonDataController {
  constructor(public entitySourceController: IEntitySourceController<Person>) {}

  handleTeamRemovedIds = async (
    people: any[],
    changeMap?: Map<string, ChangeModel>,
  ) => {
    const userConfig = new AccountUserConfig();
    const userId: Number = userConfig.getGlipUserId();
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
      if (ids.length) {
        if (changeMap) {
          changeMap.set(SERVICE.PERSON_SERVICE.TEAMS_REMOVED_FROM, {
            entities: ids,
          });
        } else {
          notificationCenter.emit(
            SERVICE.PERSON_SERVICE.TEAMS_REMOVED_FROM,
            ids,
          );
        }
      }
    }
  }

  handleIncomingData = async (
    persons: Raw<Person>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) => {
    if (persons.length === 0) {
      return;
    }
    const transformedData: Person[] = persons.map((item: Raw<Person>) =>
      transform(item),
    );
    this.handleTeamRemovedIds(transformedData, changeMap);
    this._saveDataAndDoNotification(transformedData, source, changeMap);
  }

  private _saveDataAndDoNotification(
    persons: Person[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    const deactivatedData: Person[] = [];
    const normalData: Person[] = [];
    persons.forEach((person: Person) => {
      if (person) {
        if (person.deactivated) {
          deactivatedData.push(person);
        } else {
          normalData.push(person);
        }
      }
    });

    this._saveData(deactivatedData, normalData);
    if (shouldEmitNotification(source)) {
      if (changeMap) {
        changeMap.set(ENTITY.PERSON, { entities: persons });
      } else {
        notificationCenter.emitEntityUpdate(ENTITY.PERSON, persons);
      }
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
