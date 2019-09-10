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
import { mainLogger } from 'foundation/log';

const LOG_TAG = '[TaskController]';
class TaskController implements ITaskController {
  private _strategy: ITaskStrategy;
  private _isExecuting: boolean = false;
  private _executeFunc: () => any;
  private _taskFunc: (callback: (successful: boolean) => void) => any;
  private _outerCallback?: (successful: boolean) => void;

  constructor(strategy: ITaskStrategy, executeFunc: () => any) {
    this._strategy = strategy;
    this._executeFunc = executeFunc;
  }

  async start(outerCallback?: (successful: boolean) => void) {
    this._outerCallback = outerCallback;
    if (!this._isExecuting) {
      this._start();
    }
  }

  isExecuting() {
    return this._isExecuting;
  }

  clear() {
    this._isExecuting = false;
    this._strategy.reset();
    jobScheduler.cancelJob(JOB_KEY.INDEX_DATA);
    delete this._taskCallback;
    mainLogger.tags(LOG_TAG).info('clear done');
  }

  private async _start() {
    try {
      this._strategy.reset();
      jobScheduler.cancelJob(JOB_KEY.INDEX_DATA);
      await this._doExecuting();
      this._outerCallback && this._outerCallback(true);
    } catch (err) {
      mainLogger.tags(LOG_TAG).info('_execute failed:', err);
      this._setExecuting(false);
      this._retry();
    }
  }

  private _createTaskFunc() {
    this._taskFunc = async (callback: (successful: boolean) => void) => {
      try {
        await this._doExecuting();
        callback(true);
      } catch (err) {
        this._setExecuting(false);
        mainLogger.tags(LOG_TAG).info('_retry failed:', err);
        callback(false);
      }
    };
  }

  private async _doExecuting() {
    this._setExecuting(true);
    await this._executeFunc();
    this._setExecuting(false);
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
    this._setExecuting(false);
    if (!successful) {
      if (this._canNext()) {
        mainLogger.tags(LOG_TAG).info('_taskCallback continue the next task');
        this._retry();
      } else {
        mainLogger
          .tags(LOG_TAG)
          .info('_taskCallback can not continue the next task');
        this._outerCallback && this._outerCallback(false);
      }
    } else {
      this._outerCallback && this._outerCallback(true);
    }
  };

  private _canNext() {
    return this._strategy && this._strategy.canNext();
  }

  private _setExecuting(isExecuting: boolean) {
    this._isExecuting = isExecuting;
  }
}

export { TaskController };
