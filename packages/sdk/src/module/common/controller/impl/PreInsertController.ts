/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 09:56:08
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../../models';
import { IPreInsertController } from '../interface/IPreInsertController';
import { IPreInsertIdController } from '../interface/IPreInsertIdController';
import { IProgressService } from '../../../progress/service/IProgressService';
import notificationCenter from '../../../../service/notificationCenter';
import { IDao } from '../../../../framework/dao';
import { ControllerUtils } from '../../../../framework/controller/ControllerUtils';
import { PROGRESS_STATUS } from '../../../progress';
import PreInsertIdController from './PreInsertIdController';

class PreInsertController<T extends ExtendedBaseModel = ExtendedBaseModel>
  implements IPreInsertController<T> {
  private _preInsertIdController: IPreInsertIdController;

  constructor(
    public dao: IDao<T>,
    public progressService: IProgressService,
    public entityNotificationKey?: (entity: T) => string,
  ) {
    this._preInsertIdController = new PreInsertIdController(
      dao.getEntityName(),
    );
  }

  async insert(entity: T): Promise<void> {
    this.updateStatus(entity, PROGRESS_STATUS.INPROGRESS);
    this.dao && (await this.dao.bulkPut([entity]));
    this._preInsertIdController.insert(entity.version);
  }

  async delete(entity: T): Promise<void> {
    this.updateStatus(entity, PROGRESS_STATUS.SUCCESS);
    await this.dao.delete(entity.id);
    this._preInsertIdController.delete(entity.version);
  }

  updateStatus(entity: T, status: PROGRESS_STATUS): void {
    switch (status) {
      case PROGRESS_STATUS.INPROGRESS:
        this.progressService.addProgress(entity.id, {
          id: entity.id,
          status: PROGRESS_STATUS.INPROGRESS,
        });

        notificationCenter.emitEntityUpdate(
          this.getEntityNotificationKey(entity),
          [entity],
        );
        break;

      case PROGRESS_STATUS.FAIL:
        this.progressService.updateProgress(entity.id, {
          id: entity.id,
          status: PROGRESS_STATUS.FAIL,
        });
        break;

      case PROGRESS_STATUS.SUCCESS:
      case PROGRESS_STATUS.CANCELED:
        this.progressService.deleteProgress(entity.id);
        notificationCenter.emitEntityDelete(
          this.getEntityNotificationKey(entity),
          [entity.id],
        );
        break;
    }
  }

  async bulkDelete(entities: T[]): Promise<void> {
    if (!entities || !entities.length) {
      return;
    }
    const entityMap: Map<number, number> = new Map();
    entities.map(async (entity: T) => {
      if (this.isInPreInsert(entity.version)) {
        entityMap.set(entity.id, entity.version);
      }
    });

    if (entityMap.size) {
      await this.dao.bulkDelete([...entityMap.keys()]);
      this._preInsertIdController.bulkDelete([...entityMap.values()]);
    }
  }

  isInPreInsert(version: number): boolean {
    return this._preInsertIdController.isInPreInsert(version);
  }

  getEntityNotificationKey(entity: T) {
    if (this.entityNotificationKey) {
      return this.entityNotificationKey(entity);
    }
    return ControllerUtils.getEntityNotificationKey(this.dao);
  }
}

export { PreInsertController };
