/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 09:56:08
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../../../framework/model';
import { IPreInsertController } from '../interface/IPreInsertController';
import { ProgressService, PROGRESS_STATUS } from '../../../progress';
import notificationCenter from '../../../../service/notificationCenter';
import { BaseDao } from '../../../../dao';
import { ControllerUtils } from '../../../../framework/controller/ControllerUtils';
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

  async incomesStatusChange(id: number, shouldDelete: boolean): Promise<void> {
    const progressService: ProgressService = ProgressService.getInstance();
    if (shouldDelete) {
      progressService.deleteProgress(id);
      notificationCenter.emitEntityDelete(this.getEntityNotificationKey(), [
        id,
      ]);
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
    return ControllerUtils.getEntityNotificationKey(this.dao);
  }
}

export { PreInsertController };
