/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-14-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseModel, Raw } from '../../models';
import { mainLogger, BaseError } from 'foundation';
import _ from 'lodash';
import { EntitySourceController } from './EntitySourceController';
import notificationCenter from '../../service/notificationCenter';

class PartialModifyController<T extends BaseModel = BaseModel> {
  constructor(public entitySourceController: EntitySourceController<T>) {}

  async updatePartially(
    entityId: number,
    preHandlePartialEntity?: (
      partialEntity: Partial<Raw<T>>,
      originalEntity: T,
    ) => Partial<Raw<T>>,
    doUpdateEntity?: (updatedModel: T) => Promise<T>,
    doPartialNotify?: (
      originalModels: T[],
      updatedModels: T[],
      partialModels: Partial<Raw<T>>[],
    ) => void,
  ): Promise<T | null> {
    const id: number = entityId;
    let result: T | null = null;

    do {
      if (id <= 0) {
        mainLogger.warn('handlePartialUpdate: invalid id');
        break;
      }

      const originalEntity = await this.entitySourceController.getEntity(id);
      if (!originalEntity) {
        mainLogger.warn('handlePartialUpdate: originalEntity is nil');
        break;
      }

      if (!doUpdateEntity) {
        mainLogger.warn(
          'handlePartialUpdate: doUpdateEntity is nil, no updates',
        );
        result = originalEntity;
        break;
      }

      const partialEntity: any = {
        id: entityId,
        _id: entityId,
      };

      result = await this._handlePartialUpdateWithOriginal(
        preHandlePartialEntity
          ? await preHandlePartialEntity(partialEntity, originalEntity)
          : partialEntity,
        originalEntity,
        doUpdateEntity,
        doPartialNotify,
      );
    } while (false);

    return result;
  }

  getRollbackPartialModel(
    partialEntity: Partial<Raw<T>>,
    originalEntity: T,
  ): Partial<Raw<T>> {
    const keys = Object.keys(partialEntity);

    const rollbackPartialEntity = _.pick(originalEntity, keys);

    keys.forEach((key: string) => {
      if (!rollbackPartialEntity[key]) {
        rollbackPartialEntity[key] = undefined;
      }
    });

    return rollbackPartialEntity as Partial<Raw<T>>;
  }

  getMergedModel(partialEntity: Partial<Raw<T>>, originalEntity: T): T {
    const cloneO = _.cloneDeep(originalEntity);
    const keys = Object.keys(partialEntity);
    keys.forEach((key: any) => {
      cloneO[key] = _.cloneDeep(partialEntity[key]);
    });
    return cloneO;
  }

  private _doDefaultPartialNotify(
    updatedEntities: T[],
    partialEntities: Partial<Raw<T>>[],
  ) {
    const eventKey: string = this.entitySourceController.getEntityKey();
    if (eventKey.length > 0) {
      mainLogger.info(`_doDefaultPartialNotify: eventKey= ${eventKey}`);
      notificationCenter.emitEntityUpdate(
        eventKey,
        updatedEntities,
        partialEntities,
      );
    } else {
      mainLogger.warn('_doDefaultPartialNotify: no dao class');
    }
  }

  private async _handlePartialUpdateWithOriginal(
    partialEntity: Partial<Raw<T>>,
    originalEntity: T,
    doUpdateEntity: (updatedEntity: T) => Promise<T>,
    doPartialNotify?: (
      originalModels: T[],
      updatedModels: T[],
      partialModels: Partial<Raw<T>>[],
    ) => void,
  ): Promise<T> {
    let result: T;
    do {
      partialEntity.id = originalEntity.id;
      if (partialEntity._id) {
        delete partialEntity._id;
      }

      const rollbackPartialModel = this.getRollbackPartialModel(
        partialEntity,
        originalEntity,
      );

      if (_.isEqual(partialEntity, rollbackPartialModel)) {
        result = originalEntity;
        mainLogger.warn('handlePartialUpdate: no changes, no need update');
        break;
      }

      const mergedModel = this.getMergedModel(partialEntity, originalEntity);

      mainLogger.info('handlePartialUpdate: trigger partial update');
      await this._doPartialSaveAndNotify(
        originalEntity,
        mergedModel,
        partialEntity,
        doPartialNotify,
      );

      mainLogger.info('handlePartialUpdate: trigger doUpdateModel');

      const resp = await doUpdateEntity(mergedModel);
      if (resp instanceof BaseError || !resp) {
        mainLogger.error('handlePartialUpdate: doUpdateModel failed');
        const fullRollbackModel = this.getMergedModel(
          rollbackPartialModel,
          mergedModel,
        );
        await this._doPartialSaveAndNotify(
          mergedModel,
          fullRollbackModel,
          rollbackPartialModel,
          doPartialNotify,
        );
      }

      result = resp;
    } while (false);

    return result;
  }

  private async _doPartialSaveAndNotify(
    originalModel: T,
    updatedModel: T,
    partialModel: Partial<Raw<T>>,
    doPartialNotify?: (
      originalModels: T[],
      updatedModels: T[],
      partialModels: Partial<Raw<T>>[],
    ) => void,
  ): Promise<void> {
    const originalModels: T[] = [originalModel];
    const updatedModels: T[] = [updatedModel];
    const partialModels: Partial<Raw<T>>[] = [partialModel];
    await this.entitySourceController.bulkUpdate(partialModels);
    if (doPartialNotify) {
      doPartialNotify(originalModels, updatedModels, partialModels);
    } else {
      this._doDefaultPartialNotify(updatedModels, partialModels);
    }
  }
}

export { PartialModifyController };
