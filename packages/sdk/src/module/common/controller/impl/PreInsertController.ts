/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 09:56:08
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../../../framework/model';
import { IPreInsertController } from '../interface/IPreInsertController';
import { IProgressService } from '../../../progress/service/IProgressService';
import notificationCenter from '../../../../service/notificationCenter';
import { BaseDao } from '../../../../dao';
import { ControllerUtils } from '../../../../framework/controller/ControllerUtils';
import { PROGRESS_STATUS } from '../../../progress';
class PreInsertController<T extends IdModel = IdModel>
  implements IPreInsertController {
  constructor(
    public dao: BaseDao<T>,
    public progressService: IProgressService,
  ) {}

  async preInsert(entity: T): Promise<void> {
    this.progressService.addProgress(entity.id, {
      id: entity.id,
      status: PROGRESS_STATUS.INPROGRESS,
    });

    const key: string = this.getEntityNotificationKey();
    key.length && notificationCenter.emitEntityUpdate(key, [entity]);
    this.dao && (await this.dao.bulkPut([entity]));
  }

  async incomesStatusChange(id: number, shouldDelete: boolean): Promise<void> {
    if (shouldDelete) {
      this.progressService.deleteProgress(id);
      notificationCenter.emitEntityDelete(this.getEntityNotificationKey(), [
        id,
      ]);
      if (this.dao) {
        await this.dao.delete(id);
      }
    } else {
      this.progressService.updateProgress(id, {
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
