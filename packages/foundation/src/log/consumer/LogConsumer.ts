/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogConsumer, LogEntity } from '../types';
import { ILogApi, LogApiProxy } from './api';
import { Task, MemoryQueue, TaskQueueLoop } from './task';
import { PersistenceLogEntity, ILogPersistence } from './persistence';
import StateMachine from 'ts-javascript-state-machine';
import { configManager } from '../config';
import { randomInt, sleep } from '../utils';
import { NO_INJECT_ERROR, NETWORK_ERROR } from '../constants';

const PERSISTENCE_STATE = {
  INIT: 'INIT',
  NO_SURE: 'NO_SURE',
  NOT_EMPTY: 'NOT_EMPTY',
  EMPTY: 'EMPTY',
};

class PersistenceTask extends Task { }
class UploadMemoryLogTask extends Task {
  constructor(public logs: LogEntity[], public _logApi: ILogApi, public _logPersistence: ILogPersistence) {
    super();
    this.setOnExecute(async () => await _logApi.upload(logs));
    this.setOnAbort(async () => {
      await _logPersistence.put(transform.toPersistence(logs));
    });
  }
}
class UploadPersistenceLogTask extends Task {
  constructor(public log: PersistenceLogEntity, public _logApi: ILogApi, public _logPersistence: ILogPersistence) {
    super();
    this.setOnExecute(async () => await _logApi.upload(transform.toLogEntity(log)));
    this.setOnCompleted(async () => await _logPersistence.delete(log));
  }
}

const transform = {
  toPersistence: (logEntities: LogEntity[]): PersistenceLogEntity => {
    const target: PersistenceLogEntity = {
      id: randomInt(),
      sessionId: logEntities[0].sessionId,
      startTime: logEntities[0].timestamp,
      endTime: logEntities[logEntities.length - 1].timestamp,
      logs: logEntities,
    };
    return target;
  },
  toLogEntity: (persistenceLog: PersistenceLogEntity): LogEntity[] => {
    return persistenceLog.logs;
  },
};

export class LogConsumer implements ILogConsumer {
  private _logApi: ILogApi;
  private _logPersistence: ILogPersistence;
  private _persistenceFSM: StateMachine;
  private _memoryQueue: MemoryQueue<LogEntity>;
  private _memorySize: number;
  private _uploadTaskQueueLoop: TaskQueueLoop;
  private _persistenceTaskQueueLoop: TaskQueueLoop;
  private _timeoutId: NodeJS.Timeout;

  constructor() {
    this._memoryQueue = new MemoryQueue();
    this._memorySize = 0;
    this._logApi = new LogApiProxy();
    this._uploadTaskQueueLoop = new TaskQueueLoop()
      .setOnTaskError(async (task, error, loopController) => {
        if (error.message === NO_INJECT_ERROR || error.message === NETWORK_ERROR) {
          await sleep(5000);
          await loopController.retry();
        } else if (error.message === 'abort error') {
          await loopController.abortAll();
        } else {
          await loopController.ignore();
        }
      })
      .setOnTaskCompleted(async (task, loopController) => {
        await loopController.next();
      })
      .setOnLoopCompleted(async () => {
        if (this._persistenceFSM.state !== PERSISTENCE_STATE.EMPTY) {
          this._consumePersistence();
        }
      });
    this._persistenceTaskQueueLoop = new TaskQueueLoop();
    this._persistenceFSM = new StateMachine({
      init: PERSISTENCE_STATE.INIT,
      transitions: [
        { name: 'initial', from: PERSISTENCE_STATE.INIT, to: PERSISTENCE_STATE.NO_SURE },
        { name: 'ensureEmpty', from: PERSISTENCE_STATE.NO_SURE, to: PERSISTENCE_STATE.EMPTY },
        { name: 'ensureNotEmpty', from: PERSISTENCE_STATE.NO_SURE, to: PERSISTENCE_STATE.NOT_EMPTY },
        { name: 'consume', from: PERSISTENCE_STATE.NOT_EMPTY, to: PERSISTENCE_STATE.EMPTY },
        { name: 'append', from: PERSISTENCE_STATE.EMPTY, to: PERSISTENCE_STATE.NOT_EMPTY },
      ],
      methods: {
        onInitial: () => {
          this._ensurePersistenceState();
        },
        onEnsureEmpty: () => {
        },
        onEnsureNotEmpty: () => {
          this._consumePersistence();
        },
        onConsume: () => {
        },
        onAppend: () => {
          this._consumePersistence();
        },
      },
    });
  }

  async onLog(logEntity: LogEntity): Promise<void> {
    this._memoryQueue.addTail(logEntity);
    this._memorySize += logEntity.size;
    const {
      memoryCountThreshold,
      memorySizeThreshold,
    } = configManager.getConfig().consumer;
    if (this._memoryQueue.size() > memoryCountThreshold
      || this._memorySize > memorySizeThreshold) {
      this._flushMemory();
    }
  }

  async flush(): Promise<void> {
    this._flushMemory();
    this._uploadTaskQueueLoop.abortAll();
  }

  public setLogPersistence(logPersistence: ILogPersistence) {
    this._logPersistence = logPersistence;
    this._init();
  }

  private _init() {
    this._persistenceTaskQueueLoop.addTail(
      new PersistenceTask()
        .setOnExecute(async () => {
          await this._logPersistence.init();
        }),
    );
    this._persistenceFSM.initial();
    this._flushInTimeout();
  }

  private _flushInTimeout() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
    }
    this._timeoutId = setTimeout(() => {
      this._flushMemory();
    },                           configManager.getConfig().consumer.autoFlushTimeCycle);
  }

  private _flushMemory() {
    const logs = this._memoryQueue.peekAll();
    this._memorySize = 0;
    this._flushInTimeout();
    if (logs.length < 1) return;
    if (this._persistenceFSM.state === PERSISTENCE_STATE.EMPTY && this._uploadAvailable()) {
      this._uploadTaskQueueLoop.addTail(
        new UploadMemoryLogTask(logs, this._logApi, this._logPersistence),
      );
    } else {
      this._persistenceTaskQueueLoop.addTail(
        new PersistenceTask() // cache task
          .setOnExecute(async () => {
            await this._logPersistence.put(transform.toPersistence(logs));
            if (this._persistenceFSM.state !== PERSISTENCE_STATE.NOT_EMPTY) {
              this._persistenceFSM.append();
            }
          }),
      );
    }
  }

  private _ensurePersistenceState() {
    this._persistenceTaskQueueLoop.addTail(
      new PersistenceTask()
        .setOnExecute(async () => {
          // console.log(TAG, 'ensure state start --', this._logPersistence);
          const count = await this._logPersistence.count();
          if (this._persistenceFSM.state === PERSISTENCE_STATE.NO_SURE) {
            if (count) {
              this._persistenceFSM.ensureNotEmpty();
            } else {
              this._persistenceFSM.ensureEmpty();
            }
          }
        }),
    );
  }

  private _consumePersistence() {
    const {
      consumer: {
        uploadQueueLimit,
      },
    } = configManager.getConfig();
    if (this._uploadAvailable()) {
      this._persistenceTaskQueueLoop.addTail(
        new PersistenceTask()
          .setOnExecute(async () => {
            // const limit = this._uploadLimit;
            const persistenceLogs = await this._logPersistence.getAll(uploadQueueLimit);
            if (persistenceLogs && persistenceLogs.length) {
              persistenceLogs.forEach((persistenceLog) => {
                this._uploadTaskQueueLoop.addTail(
                  new UploadPersistenceLogTask(persistenceLog, this._logApi, this._logPersistence),
                );
              });
              if (persistenceLogs.length < uploadQueueLimit) {
                this._persistenceFSM.consume();
              }
            } else {
              if (this._persistenceFSM.state === PERSISTENCE_STATE.NOT_EMPTY) {
                this._persistenceFSM.consume();
              }
            }
          }),
      );
    }
  }

  private _uploadAvailable(): boolean {
    const {
      uploadAccessor,
      consumer: {
        uploadQueueLimit,
      },
    } = configManager.getConfig();
    do {
      if (uploadAccessor && !uploadAccessor.isAccessible()) break;
      if (this._uploadTaskQueueLoop.size() >= uploadQueueLimit) break;
      if (!this._uploadTaskQueueLoop.isAvailable()) break;
      return true;
    } while (true);
    return false;
  }
}
