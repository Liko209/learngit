/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 09:56:08
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IPreInsertController } from '../interface/IPreInsertController';
import { ProgressService, PROGRESS_STATUS } from '../../../module/progress';
import notificationCenter from '../../../service/notificationCenter';
import { BaseDao } from '../../../dao';
class PreInsertController<T extends IdModel = IdModel>
  implements IPreInsertController {
  constructor(public dao: BaseDao<T>) {}

  async preInsert(entity: T): Promise<void> {
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.addProgress(entity.id, {
      id: entity.id,
      status: PROGRESS_STATUS.INPROGRESS,
    });

    this.dao && (await this.dao.bulkPut([entity]));

    const key: string = this.getEntityNotificationKey();
    key.length && notificationCenter.emitEntityUpdate(key, [entity]);
  }

  async incomesStatusChange(id: number, success: boolean): Promise<void> {
    const progressService: ProgressService = ProgressService.getInstance();
    if (success) {
      progressService.deleteProgress(id);
      if (this.dao) {
        await this.dao.delete(id);
      }
    } else {
      progressService.updateProgress(id, {
        id,
        status: PROGRESS_STATUS.FAIL,
      });
    }
  }

  getEntityNotificationKey() {
    if (this.dao) {
      console.log(this.dao);
      const modelName = this.dao.modelName.toUpperCase();
      const eventKey: string = `ENTITY.${modelName}`;
      return eventKey;
    }
    throw new Error('PreInsertController not dao instance');
  }
}

export { PreInsertController };
