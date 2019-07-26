/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw, ModelIdType } from '../../model';
import { mainLogger } from 'foundation';
import _ from 'lodash';
import { IPartialEntitySourceController } from '../interface/IPartialEntitySourceController';
import notificationCenter from '../../../service/notificationCenter';
import {
  IPartialModifyController,
  PartialUpdateParams,
  PartialNotifyFunc,
  UpdateEntityFunc,
} from '../interface/IPartialModifyController';
import { transform } from '../../../service/utils';

class PartialModifyController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> implements IPartialModifyController<T, IdType> {
  constructor(
    public entitySourceController: IPartialEntitySourceController<T, IdType>,
  ) {}

  /* eslint-disable */
  async updatePartially(
    params: PartialUpdateParams<T, IdType>,
  ): Promise<T | null> {
    const {
      entityId,
      preHandlePartialEntity,
      doUpdateEntity,
      doPartialNotify,
      saveLocalFirst = true,
    } = params;

    const id: IdType = entityId;
    let result: T | null = null;

    do {
      const originalEntity = await this.entitySourceController.get(id);
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
        saveLocalFirst,
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
    updatedEntity: T,
    partialEntity: Partial<Raw<T>>,
  ) {
    const eventKey: string = this.entitySourceController.getEntityNotificationKey();
    if (eventKey.length > 0) {
      mainLogger.info(`_doDefaultPartialNotify: eventKey= ${eventKey}`);
      notificationCenter.emitEntityUpdate<T, IdType>(
        eventKey,
        [updatedEntity],
        [partialEntity],
      );
    } else {
      mainLogger.warn('_doDefaultPartialNotify: no dao class');
    }
  }

  private async _handlePartialUpdateWithOriginal(
    partialEntity: Partial<Raw<T>>,
    originalEntity: T,
    doUpdateEntity: UpdateEntityFunc<T>,
    doPartialNotify?: PartialNotifyFunc<T>,
    saveLocalFirst = true,
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
        mainLogger.info('handlePartialUpdate: no changes, no need update');
        break;
      }

      const mergedEntity = this.getMergedEntity(partialEntity, originalEntity);

      mainLogger.info('handlePartialUpdate: trigger partial update');
      saveLocalFirst &&
        (await this._doPartialSaveAndNotify(
          originalEntity,
          mergedEntity,
          partialEntity,
          doPartialNotify,
        ));

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

        throw e;
      }
    } while (false);

    return result;
  }

  private async _doPartialSaveAndNotify(
    originalEntity: T,
    updatedEntity: T,
    partialEntity: Partial<Raw<T>>,
    doPartialNotify?: PartialNotifyFunc<T>,
  ): Promise<void> {
    const transformedModel = transform<T>(partialEntity);
    await this.entitySourceController.update(transformedModel);
    if (doPartialNotify) {
      doPartialNotify([originalEntity], [updatedEntity], [partialEntity]);
    } else {
      this._doDefaultPartialNotify(updatedEntity, partialEntity);
    }
  }
}

export { PartialModifyController };
