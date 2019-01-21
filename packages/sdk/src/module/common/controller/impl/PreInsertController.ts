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
import { BaseDao } from '../../../../dao';
import { ControllerUtils } from '../../../../framework/controller/ControllerUtils';
import { PROGRESS_STATUS } from '../../../progress';
import PreInsertIdController from './PreInsertIdController';
class PreInsertController<T extends ExtendedBaseModel = ExtendedBaseModel>
  implements IPreInsertController<T> {
  private _preInsertIdController: IPreInsertIdController;

  constructor(
    public dao: BaseDao<T>,
    public progressService: IProgressService,
  ) {
    this._preInsertIdController = new PreInsertIdController(dao.modelName);
  }

  async preInsert(entity: T): Promise<void> {
    this.progressService.addProgress(entity.id, {
      id: entity.id,
      status: PROGRESS_STATUS.INPROGRESS,
    });

    const key: string = this.getEntityNotificationKey();
    key.length && notificationCenter.emitEntityUpdate(key, [entity]);
    this.dao && (await this.dao.bulkPut([entity]));
    this._preInsertIdController.insertId(entity.version);
  }

  async incomesStatusChange(entity: T, shouldDelete: boolean): Promise<void> {
    if (shouldDelete) {
      this.progressService.deleteProgress(entity.id);
      notificationCenter.emitEntityDelete(this.getEntityNotificationKey(), [
        entity.id,
      ]);
      if (this.dao) {
        await this.dao.delete(entity.id);
      }
      this._preInsertIdController.deleteId(entity.version);
    } else {
      this.progressService.updateProgress(entity.id, {
        id: entity.id,
        status: PROGRESS_STATUS.FAIL,
      });
    }
  }

  isInPreInsert(version: number): boolean {
    return this._preInsertIdController.isInPreInsert(version);
  }

  getEntityNotificationKey() {
    return ControllerUtils.getEntityNotificationKey(this.dao);
  }
}

export { PreInsertController };
