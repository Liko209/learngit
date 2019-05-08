/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-05-06 11:03:41
 * Copyright © RingCentral. All rights reserved.
 */
import { ITaskStrategy } from '../../../framework/strategy/ITaskStrategy';
import { JOB_KEY } from 'sdk/framework/utils/jobSchedule';

const RETRY_AFTER_STRATEGY: number[] = [
  3,
  5,
  10,
  60,
  3 * 60,
  5 * 60,
  10 * 60,
  30 * 60,
  60 * 60,
];

class IndexDataTaskStrategy implements ITaskStrategy {
  private _retryIndex: number = -1;

  getNext(): number {
    if (this._retryIndex < RETRY_AFTER_STRATEGY.length - 1) {
      this._retryIndex += 1;
    }
    return RETRY_AFTER_STRATEGY[this._retryIndex];
  }

  canNext(): boolean {
    return true;
  }

  reset(): void {
    this._retryIndex = -1;
  }

  getJobKey(): JOB_KEY {
    return JOB_KEY.INDEX_DATA;
  }
}

export { IndexDataTaskStrategy };
