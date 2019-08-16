/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-04 20:30:22
 * Copyright © RingCentral. All rights reserved.
 */

import { JobInfo } from './types';
import { JOB_KEY, DailyJobIntervalSeconds } from './constants';
import { JobSchedulerConfig } from './JobSchedulerConfig';
import notificationCenter from '../../../service/notificationCenter';
import { WINDOW, SERVICE } from '../../../service/eventKey';
import { mainLogger } from 'foundation/log';
import {
  SequenceProcessorHandler,
  IProcessor,
  SingletonSequenceProcessor,
} from 'sdk/framework/processor';


class ScheduleJobProcessor implements IProcessor {
  constructor(
    private _name: string,
    private _processFunc: () => Promise<void>,
  ) {}

  async process(): Promise<boolean> {
    await this._processFunc();
    return true;
  }

  name(): string {
    return `${this._name}`;
  }
}

const UTIL_NAME = 'JobScheduler';

class JobScheduler {
  private _isOnline: boolean;
  private _jobMap: Map<JOB_KEY, JobInfo>;
  private _userConfig: JobSchedulerConfig;
  private _jobProcessor: SequenceProcessorHandler;

  constructor() {
    this._isOnline = true;
    this._jobMap = new Map<JOB_KEY, JobInfo>();
    this._jobProcessor = SingletonSequenceProcessor.getSequenceProcessorHandler(
      { name: UTIL_NAME },
    );
    notificationCenter.on(WINDOW.ONLINE, ({ onLine }) => {
      this.onNetWorkChanged(onLine);
    });
    notificationCenter.on(SERVICE.LOGOUT, () => {
      this.clear();
    });
  }

  get userConfig(): JobSchedulerConfig {
    if (!this._userConfig) {
      this._userConfig = new JobSchedulerConfig();
    }
    return this._userConfig;
  }

  onNetWorkChanged(isOnline: boolean): void {
    if (!isOnline) {
      this._isOnline = false;
      return;
    }

    this._isOnline = true;
    this._jobMap.forEach((info: JobInfo, key: JOB_KEY) => {
      if (!info.needNetwork) {
        return;
      }
      if (
        this._canExecute(info, this._getLastSuccessTime(key)) &&
        !info.isExecuting
      ) {
        if (info.jobId) {
          clearTimeout(info.jobId);
        }
        this._addProcessor(info);
      }
    });
  }

  scheduleDailyPeriodicJob(
    key: JOB_KEY,
    executeFunc: (callback: (successful: boolean) => void) => any,
    needNetwork: boolean,
    ignoreFirstTime: boolean,
  ) {
    const info: JobInfo = {
      key,
      executeFunc,
      needNetwork,
      intervalSeconds: DailyJobIntervalSeconds,
      periodic: true,
    };
    if (ignoreFirstTime) {
      this.scheduleAndIgnoreFirstTime(info);
    } else {
      this.scheduleJob(info);
    }
  }

  preSchedule(info: JobInfo): void {
    if (this._jobMap.has(info.key)) {
      mainLogger.tags(UTIL_NAME).warn(
        `already has job: ${info.key},
        will remove the old job and schedule again.`,
      );
      this.cancelJob(info.key, false);
    }
    info.isDropt = false;
    info.isExecuting = false;
    this._jobMap.set(info.key, info);
  }

  scheduleJob(info: JobInfo, force: boolean = false): void {
    this.preSchedule(info);

    if (force) {
      this._addProcessor(info);
      return;
    }

    const lastSuccessTime: number = this._getLastSuccessTime(info.key);
    if (this._canExecute(info, lastSuccessTime)) {
      this._addProcessor(info);
      return;
    }

    const interval =
      info.intervalSeconds * 1000 - (Date.now() - lastSuccessTime);
    info.jobId = this._setTimer(
      info,
      interval > 0 ? interval : info.intervalSeconds * 1000,
    );
  }

  scheduleAndIgnoreFirstTime(info: JobInfo): void {
    this.preSchedule(info);
    if (info.periodic) {
      this._setLastSuccessTime(info.key, Date.now());
    }
    info.jobId = this._setTimer(info, info.intervalSeconds * 1000);
  }

  cancelJob(key: JOB_KEY, removeLastTime: boolean = false): void {
    mainLogger.tags(UTIL_NAME).debug(`cancelJob ${key}, ${removeLastTime}`);
    const info = this._jobMap.get(key);
    if (info) {
      info.isDropt = true;
      if (info.jobId) {
        clearTimeout(info.jobId);
      }
      this._jobMap.delete(key);
    }
    if (removeLastTime) {
      this._removeLastSuccessTime(key);
    }
  }

  clear() {
    this._jobMap.forEach((info: JobInfo, key: JOB_KEY) => {
      info.isDropt = true;
      if (info.jobId) {
        clearTimeout(info.jobId);
      }
      this._removeLastSuccessTime(key);
    });
    this._jobMap.clear();
  }

  private _getLastSuccessTime(key: JOB_KEY): number {
    try {
      return this.userConfig.getLastSuccessTime(key) || 0;
    } catch (err) {
      mainLogger.tags(UTIL_NAME).error(`_getLastSuccessTime error => ${err}`);
      return 0;
    }
  }

  private _setLastSuccessTime(key: JOB_KEY, value: number): boolean {
    try {
      this.userConfig.setLastSuccessTime(key, value);
    } catch (err) {
      mainLogger.tags(UTIL_NAME).error(`_setLastSuccessTime error => ${err}`);
      return false;
    }
    return true;
  }

  private _removeLastSuccessTime(key: JOB_KEY): boolean {
    try {
      this.userConfig.removeLastSuccessTime(key);
    } catch (err) {
      mainLogger
        .tags(UTIL_NAME)
        .error(`_removeLastSuccessTime error => ${err}`);
      return false;
    }
    return true;
  }

  private _setTimer(info: JobInfo, interval: number): NodeJS.Timeout {
    mainLogger.tags(UTIL_NAME).debug(`_setTimer, ${info.key}, ${interval}`);
    return setTimeout(() => {
      this._addProcessor(info);
    }, interval);
  }

  private _canExecute(info: JobInfo, lastSuccessTime: number): boolean {
    if (info.needNetwork && !this._isOnline) {
      return false;
    }
    const currentTime: number = Date.now();
    mainLogger
      .tags(UTIL_NAME)
      .debug(`_canExecute, ${info.key}, ${currentTime}, ${lastSuccessTime}`);
    return currentTime - lastSuccessTime >= info.intervalSeconds * 1000;
  }

  private _addProcessor(info: JobInfo): void {
    const processor = new ScheduleJobProcessor(info.key, async () => {
      await this._execute(info);
    });
    this._jobProcessor.addProcessor(processor);
  }

  private async _execute(info: JobInfo): Promise<void> {
    if (info.isExecuting || info.isDropt) {
      mainLogger.tags(UTIL_NAME).debug(`can not execute ${info.key}`);
      return;
    }

    const onExecutionFinished = (successful: boolean) => {
      mainLogger
        .tags(UTIL_NAME)
        .debug(`onExecutionFinished ${info.key} => ${successful}`);
      if (!info || info.isDropt) {
        return;
      }
      info.isExecuting = false;
      if (successful) {
        if (info.periodic) {
          this._setLastSuccessTime(info.key, Date.now());
          info.jobId = this._setTimer(info, info.intervalSeconds * 1000);
        } else {
          this.cancelJob(info.key, true);
        }
      } else if (info.periodic) {
        info.jobId = this._setTimer(info, info.intervalSeconds * 1000);
      } else {
        const haveRetryTime = info.retryTime && info.retryTime > 0;
        if (info.retryForever || haveRetryTime) {
          if (haveRetryTime) {
            info.retryTime = info.retryTime! - 1;
          }
          info.jobId = this._setTimer(info, info.intervalSeconds * 1000);
        } else {
          this.cancelJob(info.key, true);
        }
      }
      if (info.callback) {
        info.callback(successful);
      }
    };

    info.isExecuting = true;
    mainLogger.tags(UTIL_NAME).debug(`start execute ${info.key}`);
    try {
      await info.executeFunc(onExecutionFinished);
    } catch (err) {
      mainLogger
        .tags(UTIL_NAME)
        .error(`execute failed ${info.key}, error => ${err}`);
      onExecutionFinished(false);
    }
  }
}

export { JobScheduler };
