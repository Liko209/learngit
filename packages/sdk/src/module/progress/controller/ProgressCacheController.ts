/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 13:42:28
 * Copyright © RingCentral. All rights reserved.
 */

import { Progress } from '../entity';
import { mainLogger } from 'foundation/log';
import notificationCenter from '../../../service/notificationCenter';
import { ENTITY } from '../../../service/eventKey';

class ProgressCacheController {
  private _progressCache: Map<number, Progress>;
  constructor() {
    this._progressCache = new Map();
  }

  getProgress(id: number): Progress | null {
    return this._progressCache.get(id) || null;
  }

  addProgress(id: number, progress: Progress) {
    this._progressCache.set(id, progress);
    notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [progress]);
  }

  updateProgress(id: number, progress: Progress) {
    if (this._progressCache.has(id)) {
      this._progressCache.set(id, progress);
      notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [progress]);
    } else {
      mainLogger.warn(
        `ProgressCacheController, should not call update no cache found, ${id}`,
      );
    }
  }

  deleteProgress(id: number) {
    this._progressCache.delete(id);
    notificationCenter.emitEntityDelete(ENTITY.PROGRESS, [id]);
  }
}

export { ProgressCacheController };
