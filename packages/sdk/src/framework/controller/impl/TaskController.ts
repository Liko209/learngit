/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 08:40:42
 * Copyright © RingCentral. All rights reserved.
 */

import { ITaskController } from '../interface/ITaskController';
import { ITaskStrategy } from 'sdk/framework/strategy/ITaskStrategy';
import {
  jobScheduler,
  JOB_KEY,
  JobInfo,
} from 'sdk/framework/utils/jobSchedule';
import { mainLogger } from 'foundation/src';

const LOG_TAG = '[TaskController]';
class TaskController implements ITaskController {
  private _strategy: ITaskStrategy;
  private _isExecuting: boolean = false;
  private _executeFunc: () => any;

  constructor(strategy: ITaskStrategy) {
    this._strategy = strategy;
  }

  start(executeFunc: () => any) {
    if (this._isExecuting) {
      mainLogger.tags(LOG_TAG).info('start() task is in executing');
      return;
    }
    this.reset();
    this._execute(executeFunc, false);
  }

  private _execute(executeFunc: () => any, isRetry: boolean) {
    this._executeFunc = executeFunc;
    const taskFunc = async (callback: (successful: boolean) => void) => {
      try {
        this._isExecuting = true;
        await this._executeFunc();
        this._isExecuting = false;
        callback(true);
        this.reset();
      } catch (err) {
        mainLogger.tags(LOG_TAG).info('_execute failed:', err);
        this._isExecuting = false;
        callback(false);
      }
    };
    const info: JobInfo = {
      key: this._strategy.getJobKey(),
      executeFunc: taskFunc,
      callback: this._taskCallback,
      needNetwork: false,
      intervalSeconds: isRetry ? this._strategy.getNext() : 0,
      periodic: false,
    };
    if (isRetry) {
      jobScheduler.scheduleAndIgnoreFirstTime(info);
    } else {
      jobScheduler.scheduleJob(info);
    }
  }

  private _taskCallback = (successful: boolean) => {
    if (!successful) {
      if (this._canNext()) {
        mainLogger.tags(LOG_TAG).info('_taskCallback continue the next task');
        this._execute(this._executeFunc, true);
      } else {
        mainLogger
          .tags(LOG_TAG)
          .info('_taskCallback can not continue the next task, reset it');
        this.reset();
      }
    }
  }

  private _canNext() {
    return this._strategy && this._strategy.canNext();
  }

  reset(): void {
    this._strategy.reset();
    jobScheduler.cancelJob(JOB_KEY.INDEX_DATA);
  }
}

export { TaskController };
