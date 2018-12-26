/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 10:42:57
 * Copyright © RingCentral. All rights reserved.
 */

import { Progress } from '../../../models';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { ProgressCacheController } from '../controller/ProgressCacheController';

class ProgressService extends EntityBaseService<Progress> {
  static serviceName = 'ProgressService';
  private _progressCacheController: ProgressCacheController;
  constructor() {
    super();
  }

  private get _cacheController() {
    if (!this._progressCacheController) {
      this._progressCacheController = new ProgressCacheController();
    }
    return this._progressCacheController;
  }

  addProgress(id: number, status: Progress) {
    this._cacheController.addProgress(id, status);
  }

  updateProgress(id: number, status: Progress) {
    this._cacheController.updateProgress(id, status);
  }

  deleteProgress(id: number) {
    this._cacheController.deleteProgress(id);
  }

  getById(id: number) {
    return id < 0 ? this._cacheController.getProgress(id) : undefined;
  }
}

export { ProgressService };
