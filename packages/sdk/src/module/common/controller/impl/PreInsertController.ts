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
import _ from 'lodash';
import { mainLogger } from 'foundation/log';

const LOG_TAG = '[PreInsertController]';
const UNIQUE_ID = 'unique_id';
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
    this.updateStatus(entity.id, PROGRESS_STATUS.INPROGRESS);
    notificationCenter.emitEntityUpdate(this.getEntityNotificationKey(entity), [
      entity,
    ]);
    const preInsertId = entity.id;
    const preInsertKey = this._getPreInsertKey(entity);
    if (preInsertKey && !this.isInPreInsert(preInsertKey)) {
      this.dao && (await this.dao.bulkPut([entity]));
      this._preInsertIdController.insert(preInsertKey, preInsertId);
    } else {
      mainLogger.tags(LOG_TAG).info(`insert() ${entity.id} already pre-insert`);
    }
  }

  async update(entity: T): Promise<void> {
    notificationCenter.emitEntityUpdate(this.getEntityNotificationKey(entity), [
      entity,
    ]);
    const preInsertKey = this._getPreInsertKey(entity);
    if (preInsertKey && !this.isInPreInsert(preInsertKey)) {
      this.dao && (await this.dao.update(entity));
    } else {
      mainLogger
        .tags(LOG_TAG)
        .info(`update() ${entity.id} not exists pre-insert`);
    }
  }

  async delete(entity: T): Promise<void> {
    const originalEntityId = this._deleteEntity(entity);
    if (originalEntityId) {
      await this.dao.delete(originalEntityId);
      const preInsertId = this._getPreInsertKey(entity);
      this._preInsertIdController.delete(preInsertId);
    }
  }

  getPreInsertId(uniqueId: string): number {
    return this._preInsertIdController.getPreInsertId(uniqueId);
  }

  private _deleteEntity(entity: T): number | undefined {
    const preInsertKey = this._getPreInsertKey(entity);
    if (preInsertKey && this.isInPreInsert(preInsertKey)) {
      const originalEntityId = this._preInsertIdController.getPreInsertId(
        preInsertKey,
      );
      const progressEntity = _.cloneDeep(entity);
      progressEntity.id > 0 && (progressEntity.id = originalEntityId);
      this._notifyChange(entity, originalEntityId);
      this.updateStatus(progressEntity.id, PROGRESS_STATUS.SUCCESS);
      return originalEntityId;
    }
    mainLogger
      .tags(LOG_TAG)
      .info(`delete() ${entity.id} is not in pre-insert list`);
    return undefined;
  }

  updateStatus(entityId: number, status: PROGRESS_STATUS): void {
    switch (status) {
      case PROGRESS_STATUS.INPROGRESS:
        this.progressService.addProgress(entityId, {
          id: entityId,
          status: PROGRESS_STATUS.INPROGRESS,
        });
        break;

      case PROGRESS_STATUS.FAIL:
        this.progressService.updateProgress(entityId, {
          id: entityId,
          status: PROGRESS_STATUS.FAIL,
        });
        break;

      case PROGRESS_STATUS.SUCCESS:
      case PROGRESS_STATUS.CANCELED:
        this.progressService.deleteProgress(entityId);
        break;
      default:
        break;
    }
  }

  async bulkDelete(entities: T[]): Promise<void> {
    if (!entities || !entities.length) {
      return;
    }
    const entityMap: Map<number, string> = new Map();
    entities.map((entity: T) => {
      const originalEntityId = this._deleteEntity(entity);
      if (originalEntityId) {
        const preInsertKey = this._getPreInsertKey(entity);
        preInsertKey &&
          originalEntityId &&
          entityMap.set(originalEntityId, preInsertKey);
      }
    });
    if (entityMap.size) {
      await this.dao.bulkDelete([...entityMap.keys()]);
      this._preInsertIdController.bulkDelete([...entityMap.values()]);
    }
  }

  isInPreInsert(uniqueId: string): boolean {
    return this._preInsertIdController.isInPreInsert(uniqueId);
  }

  getAll(): { uniqueIds: string[]; ids: number[] } {
    return this._preInsertIdController.getAll();
  }

  getEntityNotificationKey(entity: T) {
    if (this.entityNotificationKey) {
      return this.entityNotificationKey(entity);
    }
    return ControllerUtils.getEntityNotificationKey(this.dao);
  }

  private _getPreInsertKey(entity: T) {
    return this._getUniqueId(entity) || entity.version.toString();
  }

  private _getUniqueId(entity: T) {
    let preInsertId: string = '';
    if (Object.prototype.hasOwnProperty.call(entity, UNIQUE_ID)) {
      preInsertId = entity[UNIQUE_ID];
    }
    return preInsertId;
  }

  private async _notifyChange(entity: T, originalEntityId: number) {
    if (entity.id > 0) {
      notificationCenter.emitEntityReplace(
        this.getEntityNotificationKey(entity),
        new Map().set(originalEntityId, _.cloneDeep(entity)),
      );
    } else {
      notificationCenter.emitEntityDelete(
        this.getEntityNotificationKey(entity),
        [entity.id],
      );
    }
  }
}

export { PreInsertController };
