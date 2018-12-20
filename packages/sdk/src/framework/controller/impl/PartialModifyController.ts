/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseModel, Raw } from '../../../models';
import { mainLogger } from 'foundation';
import _ from 'lodash';
import { IEntitySourceController } from '../interface/IEntitySourceController';
import notificationCenter from '../../../service/notificationCenter';
import { ErrorParser } from '../../../utils';
import { IPartialModifyController } from '../interface/IPartialModifyController';

class PartialModifyController<T extends BaseModel = BaseModel>
  implements IPartialModifyController<T> {
  constructor(public entitySourceController: IEntitySourceController<T>) {}

  async updatePartially(
    entityId: number,
    preHandlePartialEntity?: (
      partialEntity: Partial<Raw<T>>,
      originalEntity: T,
    ) => Partial<Raw<T>>,
    doUpdateEntity?: (updatedEntity: T) => Promise<T>,
    doPartialNotify?: (
      originalEntities: T[],
      updatedEntities: T[],
      partialEntities: Partial<Raw<T>>[],
    ) => void,
  ): Promise<T | null> {
    const id: number = entityId;
    let result: T | null = null;

    do {
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

  getRollbackPartialEntity(
    partialEntity: Partial<Raw<T>>,
    originalEntity: T,
  ): Partial<Raw<T>> {
    const keys = Object.keys(partialEntity);

    const rollbackPartialEntity = _.pick(originalEntity, keys);

    keys.forEach((key: string) => {
      if (!rollbackPartialEntity.hasOwnProperty(key)) {
        rollbackPartialEntity[key] = undefined;
      }
    });

    return rollbackPartialEntity as Partial<Raw<T>>;
  }

  getMergedEntity(partialEntity: Partial<Raw<T>>, originalEntity: T): T {
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
    const eventKey: string = this.entitySourceController.getEntityNotificationKey();
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
      originalEntities: T[],
      updatedEntities: T[],
      partialEntities: Partial<Raw<T>>[],
    ) => void,
  ): Promise<T> {
    let result: T;
    do {
      partialEntity.id = originalEntity.id;
      if (partialEntity._id) {
        delete partialEntity._id;
      }

      const rollbackPartialEntity = this.getRollbackPartialEntity(
        partialEntity,
        originalEntity,
      );

      if (_.isEqual(partialEntity, rollbackPartialEntity)) {
        result = originalEntity;
        mainLogger.warn('handlePartialUpdate: no changes, no need update');
        break;
      }

      const mergedEntity = this.getMergedEntity(partialEntity, originalEntity);

      mainLogger.info('handlePartialUpdate: trigger partial update');
      await this._doPartialSaveAndNotify(
        originalEntity,
        mergedEntity,
        partialEntity,
        doPartialNotify,
      );

      mainLogger.info('handlePartialUpdate: trigger doUpdateEntity');

      try {
        result = await doUpdateEntity(mergedEntity);
      } catch (e) {
        mainLogger.error('handlePartialUpdate: doUpdateEntity failed');
        const fullRollbackEntity = this.getMergedEntity(
          rollbackPartialEntity,
          mergedEntity,
        );
        await this._doPartialSaveAndNotify(
          mergedEntity,
          fullRollbackEntity,
          rollbackPartialEntity,
          doPartialNotify,
        );

        throw ErrorParser.parse(e);
      }
    } while (false);

    return result;
  }

  private async _doPartialSaveAndNotify(
    originalEntity: T,
    updatedEntity: T,
    partialEntity: Partial<Raw<T>>,
    doPartialNotify?: (
      originalEntities: T[],
      updatedEntities: T[],
      partialEntities: Partial<Raw<T>>[],
    ) => void,
  ): Promise<void> {
    const originalEntities: T[] = [originalEntity];
    const updatedEntities: T[] = [updatedEntity];
    const partialEntities: Partial<Raw<T>>[] = [partialEntity];
    await this.entitySourceController.bulkUpdate(partialEntities);
    if (doPartialNotify) {
      doPartialNotify(originalEntities, updatedEntities, partialEntities);
    } else {
      this._doDefaultPartialNotify(updatedEntities, partialEntities);
    }
  }
}

export { PartialModifyController };
