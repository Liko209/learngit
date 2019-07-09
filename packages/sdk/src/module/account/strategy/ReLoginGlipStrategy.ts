/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-07-01 19:13:41
 * Copyright © RingCentral. All rights reserved.
 */

import { ITaskStrategy } from 'sdk/framework/strategy/ITaskStrategy';
import { JOB_KEY } from 'sdk/framework/utils/jobSchedule';

const MAX_RETRY_INDEX: number = 11;

class ReLoginGlipStrategy implements ITaskStrategy {
  private _retryIndex: number = 1;

  getNext(): number {
    const index =
      this._retryIndex > MAX_RETRY_INDEX ? MAX_RETRY_INDEX : this._retryIndex;
    const min = 2 ** index;
    const max = index === MAX_RETRY_INDEX ? 60 * 60 : 2 ** (index + 1);
    ++this._retryIndex;
    return Math.floor(Math.random() * (max - min) + min);
  }

  canNext(): boolean {
    return true;
  }

  reset(): void {
    this._retryIndex = 1;
  }

  getJobKey(): JOB_KEY {
    return JOB_KEY.GLIP_LOGIN;
  }
}

export { ReLoginGlipStrategy };
