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
import { mainLogger } from 'foundation';

const LOG_TAG = '[TaskController]';
class TaskController implements ITaskController {
  private _strategy: ITaskStrategy;
  private _isExecuting: boolean = false;
  private _executeFunc: () => any;
  private _taskFunc: (callback: (successful: boolean) => void) => any;

  constructor(strategy: ITaskStrategy, executeFunc: () => any) {
    this._strategy = strategy;
    this._executeFunc = executeFunc;
  }

  start() {
    if (this._isExecuting) {
      mainLogger.tags(LOG_TAG).info('start() task is in executing');
      return;
    }
    this.reset();
    this._execute();
  }

  private _createTaskFunc() {
    this._taskFunc = async (callback: (successful: boolean) => void) => {
      try {
        this._setExecuting(true);
        await this._executeFunc();
        callback(true);
        this.reset();
      } catch (err) {
        mainLogger.tags(LOG_TAG).info('_retry failed:', err);
        this._setExecuting(false);
        callback(false);
      }
    };
  }

  private async _execute() {
    try {
      this._setExecuting(true);
      await this._executeFunc();
      this._setExecuting(false);
    } catch (err) {
      mainLogger.tags(LOG_TAG).info('_execute failed:', err);
      this._setExecuting(false);
      this._retry();
    }
  }

  private _retry() {
    if (!this._taskFunc) {
      this._createTaskFunc();
    }
    const info: JobInfo = {
      key: this._strategy.getJobKey(),
      executeFunc: this._taskFunc,
      callback: this._taskCallback,
      needNetwork: false,
      intervalSeconds: this._strategy.getNext(),
      periodic: false,
    };
    jobScheduler.scheduleAndIgnoreFirstTime(info);
  }

  private _taskCallback = (successful: boolean) => {
    if (!successful) {
      if (this._canNext()) {
        mainLogger.tags(LOG_TAG).info('_taskCallback continue the next task');
        this._retry();
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
    this._setExecuting(false);
    this._strategy.reset();
    jobScheduler.cancelJob(JOB_KEY.INDEX_DATA);
  }

  private _setExecuting(isExecuting: boolean) {
    this._isExecuting = isExecuting;
  }
}

export { TaskController };
