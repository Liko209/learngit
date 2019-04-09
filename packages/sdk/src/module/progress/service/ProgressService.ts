/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 10:42:57
 * Copyright © RingCentral. All rights reserved.
 */

import { Progress } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { ProgressCacheController } from '../controller/ProgressCacheController';
import { IProgressService } from './IProgressService';
class ProgressService extends EntityBaseService<Progress>
  implements IProgressService {
  private _progressCacheController: ProgressCacheController;
  constructor() {
    super(false);
  }

  protected get progressCacheController() {
    if (!this._progressCacheController) {
      this._progressCacheController = new ProgressCacheController();
    }
    return this._progressCacheController;
  }

  addProgress(id: number, status: Progress) {
    this.progressCacheController.addProgress(id, status);
  }

  updateProgress(id: number, status: Progress) {
    this.progressCacheController.updateProgress(id, status);
  }

  deleteProgress(id: number) {
    this.progressCacheController.deleteProgress(id);
  }

  getByIdSync(id: number) {
    return this.progressCacheController.getProgress(id);
  }
}

export { ProgressService };
