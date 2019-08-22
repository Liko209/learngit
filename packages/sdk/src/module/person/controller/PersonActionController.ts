/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-15 14:00:10
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';

import { Person } from '../entity';
import { EditablePersonInfo, HeadShotInfo } from '../types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { mainLogger } from 'foundation/log';
import { IPartialModifyController } from 'sdk/framework/controller/interface/IPartialModifyController';
import { Raw } from 'sdk/framework/model';
import { ItemService } from 'sdk/module/item';
import { HeadShotData } from '../entity/Person';
import _ from 'lodash';
import { transform } from 'sdk/service/utils';
import { Nullable } from 'sdk/types';

const MODULE_NAME = 'PersonActionController';

class PersonActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<Person>,
    private _entitySourceController: IEntitySourceController<Person>,
  ) {}

  setCustomStatus(personId: number, status: string): Promise<Nullable<Person>> {
    if (!personId) {
      return Promise.resolve(null);
    }
    return this._partialModifyController.updatePartially({
      entityId: personId,
      preHandlePartialEntity: (partialEntity: Partial<Raw<Person>>) => {
        return {
          ...partialEntity,
          away_status: status,
        };
      },
      doUpdateEntity: (updatedEntity: Person) => {
        const requestController = this._entitySourceController.getRequestController()!;
        return requestController.put(updatedEntity);
      },
      saveLocalFirst: false,
    });
  }

  async editPersonalInfo(
    incomingInfo?: EditablePersonInfo,
    headshotInfo?: HeadShotInfo,
  ) {
    const isDataValid = incomingInfo || (headshotInfo && headshotInfo.file);
    if (!isDataValid) {
      mainLogger
        .tags(MODULE_NAME)
        .error('invalid profile data', { incomingInfo, headshotInfo });
      return;
    }

    const basicInfo =
      (incomingInfo && this._purifyProperties(incomingInfo)) || {};

    const currentPerson = await this._entitySourceController.get(
      this.currentUserGlipId(),
    );
    if (!currentPerson) {
      mainLogger.tags(MODULE_NAME).error('can not find the person');
      return null;
    }

    let finalInfo: Partial<Person> = {
      ...basicInfo,
    };

    if (headshotInfo) {
      const headshotData = await this._updateHeadShot(headshotInfo);
      finalInfo = {
        ...finalInfo,
        ...headshotData,
      };
    }

    mainLogger.tags(MODULE_NAME).info('update personal info', { finalInfo });

    const preHandleFunc = (partialEntity: Partial<Raw<Person>>) => ({
      ...partialEntity,
      ...finalInfo,
    });

    const doUpdateEntity = async (updatedEntity: Person) => {
      const requestController = this._entitySourceController.getRequestController()!;
      const result = await requestController.put(updatedEntity);
      const transformData = transform<Person>(result);
      mainLogger.tags(MODULE_NAME).log('update person result', transformData);

      await this._entitySourceController.update(transformData);
      return result;
    };

    return await this._partialModifyController.updatePartially({
      doUpdateEntity,
      entityId: this.currentUserGlipId(),
      preHandlePartialEntity: preHandleFunc,
      saveLocalFirst: false,
    });
  }

  private async _updateHeadShot(headshotInfo: HeadShotInfo) {
    const finalInfo: Partial<Person> = {};

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const storedData = await itemService.uploadFileToServer(headshotInfo.file);
    finalInfo.headshot = {
      stored_file_id: storedData._id,
      creator_id: storedData.creator_id,
      url: storedData.storage_url,
    };
    finalInfo.headshot_version = storedData.version;

    finalInfo.headshot = {
      ...(finalInfo.headshot as HeadShotData),
      offset: headshotInfo.offset,
      crop: headshotInfo.crop,
    };
    return finalInfo;
  }

  currentUserGlipId() {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    const accountConfig = accountService.userConfig;
    return accountConfig.getGlipUserId();
  }

  // protected no dirty data to server
  private _purifyProperties(basicInfo: EditablePersonInfo) {
    return _.pick(basicInfo, [
      'first_name',
      'last_name',
      'homepage',
      'job_title',
      'location',
    ]);
  }
}

export { PersonActionController };
