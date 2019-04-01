/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogConsumer, LogEntity } from '../types';
import { ILogUploader, LogUploaderProxy } from './uploader';
import { Task, MemoryQueue, TaskQueueLoop } from './task';
import { PersistenceLogEntity, ILogPersistence } from './persistence';
import StateMachine from 'ts-javascript-state-machine';
import { configManager } from '../config';
import { randomInt, sleep } from '../utils';
import sumBy from 'lodash/sumBy';
import cloneDeep from 'lodash/cloneDeep';

const PERSISTENCE_STATE = {
  INIT: 'INIT',
  NO_SURE: 'NO_SURE',
  NOT_EMPTY: 'NOT_EMPTY',
  EMPTY: 'EMPTY',
};

class PersistenceTask extends Task {}
class UploadMemoryLogTask extends Task {
  constructor(
    public logs: LogEntity[],
    public _logUploader: ILogUploader,
    public _logPersistence: ILogPersistence,
  ) {
    super();
    this.setOnExecute(async () => await _logUploader.upload(logs));
    this.setOnAbort(async () => {
      await _logPersistence.put(transform.toPersistence(logs));
    });
  }
}
class UploadPersistenceLogTask extends Task {
  constructor(
    public log: PersistenceLogEntity,
    public _logUploader: ILogUploader,
    public _logPersistence: ILogPersistence,
  ) {
    super();
    this.setOnExecute(
      async () => await _logUploader.upload(transform.toLogEntity(log)),
    );
    this.setOnCompleted(async () => await _logPersistence.delete(log));
    this.setOnAbort(async () => {
      await _logPersistence.put(log);
    });
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
      size: sumBy(logEntities, log => log.size),
    };
    return target;
  },
  toLogEntity: (persistenceLog: PersistenceLogEntity): LogEntity[] => {
    return persistenceLog.logs;
  },
};

function retryDelay(retryCount: number) {
  return Math.min(5000 + retryCount * 20000, 60 * 1000);
}

export class LogConsumer implements ILogConsumer {
  private _logUploader: ILogUploader;
  private _logPersistence: ILogPersistence;
  private _persistenceFSM: StateMachine;
  private _memoryQueue: MemoryQueue<LogEntity>;
  private _memorySize: number;
  private _uploadTaskQueueLoop: TaskQueueLoop;
  private _persistenceTaskQueueLoop: TaskQueueLoop;
  private _timeoutId: NodeJS.Timeout;
  private _flushMode: boolean;

  constructor() {
    this._memoryQueue = new MemoryQueue();
    this._memorySize = 0;
    this._flushMode = false;
    this._logUploader = new LogUploaderProxy();
    this._uploadTaskQueueLoop = new TaskQueueLoop()
      .setOnTaskError(async (task, error, loopController) => {
        const handlerType = this._logUploader.errorHandler(error);
        console.info(
          'LogConsumer onTaskError:',
          error,
          ' handlerType:',
          handlerType,
        );
        switch (handlerType) {
          case 'abort':
            await loopController.abort();
            break;
          case 'abortAll':
            await loopController.abortAll();
            break;
          case 'retry':
            await sleep(retryDelay(task.retryCount));
            task.retryCount += 1;
            await loopController.retry();
            break;
          case 'ignore':
            await loopController.ignore();
            break;
        }
      })
      .setOnTaskCompleted(async (task, loopController) => {
        await loopController.next();
      })
      .setOnLoopCompleted(async () => {
        this._consumePersistenceIfNeed();
      });
    this._persistenceTaskQueueLoop = new TaskQueueLoop();
    this._persistenceFSM = new StateMachine({
      init: PERSISTENCE_STATE.INIT,
      transitions: [
        {
          name: 'initial',
          from: PERSISTENCE_STATE.INIT,
          to: PERSISTENCE_STATE.NO_SURE,
        },
        {
          name: 'ensureEmpty',
          from: PERSISTENCE_STATE.NO_SURE,
          to: PERSISTENCE_STATE.EMPTY,
        },
        {
          name: 'ensureNotEmpty',
          from: PERSISTENCE_STATE.NO_SURE,
          to: PERSISTENCE_STATE.NOT_EMPTY,
        },
        {
          name: 'consume',
          from: PERSISTENCE_STATE.NOT_EMPTY,
          to: PERSISTENCE_STATE.EMPTY,
        },
        {
          name: 'append',
          from: PERSISTENCE_STATE.EMPTY,
          to: PERSISTENCE_STATE.NOT_EMPTY,
        },
      ],
      methods: {
        onInitial: () => {
          this._ensurePersistenceState();
        },
        onEnsureEmpty: () => {},
        onEnsureNotEmpty: () => {
          this._consumePersistenceIfNeed();
        },
        onConsume: () => {
          this._consumePersistenceIfNeed();
        },
        onAppend: () => {
          this._consumePersistenceIfNeed();
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
    if (
      this._memoryQueue.size() > memoryCountThreshold ||
      this._memorySize > memorySizeThreshold
    ) {
      this._flushMemory();
    }
  }

  async flush(): Promise<void> {
    if (this._uploadTaskQueueLoop.size() > 0) {
      // abort uploadTaskQueue's waiting task,
      this._uploadTaskQueueLoop.abortAll();
    }
    // indicated in _flushMode
    this._flushMode = true;
    this._flushMemory();
    this._flushMode = false;
  }

  public setLogPersistence(logPersistence: ILogPersistence) {
    this._logPersistence = logPersistence;
    this._init();
  }

  private _init() {
    this._persistenceTaskQueueLoop.addTail(
      new PersistenceTask().setOnExecute(async () => {
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
      this._consumePersistenceIfNeed();
      this._flushMemory();
    },                           configManager.getConfig().consumer.autoFlushTimeCycle);
  }

  private _flushMemory() {
    const logs = this._memoryQueue.peekAll();
    this._memorySize = 0;
    this._flushInTimeout();
    if (logs.length < 1) return;
    if (
      this._persistenceFSM.state === PERSISTENCE_STATE.EMPTY &&
      this._uploadAvailable()
    ) {
      this._uploadTaskQueueLoop.addTail(
        new UploadMemoryLogTask(logs, this._logUploader, this._logPersistence),
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
      new PersistenceTask().setOnExecute(async () => {
        const count = await this._logPersistence.count();
        if (this._persistenceFSM.state === PERSISTENCE_STATE.NO_SURE) {
          count
            ? this._persistenceFSM.ensureNotEmpty()
            : this._persistenceFSM.ensureEmpty();
        }
      }),
    );
  }

  private _consumePersistenceIfNeed() {
    const {
      consumer: { uploadQueueLimit },
    } = configManager.getConfig();
    if (this._uploadTaskQueueLoop.size() === 0 && this._uploadAvailable()) {
      this._persistenceTaskQueueLoop.addTail(
        new PersistenceTask().setOnExecute(async () => {
          const persistenceLogs = await this._logPersistence.getAll(
            3 * uploadQueueLimit,
          );
          if (persistenceLogs && persistenceLogs.length) {
            await this._logPersistence.bulkDelete(persistenceLogs);
            const combineLogs = this._combinePersistenceLogs(persistenceLogs);
            combineLogs.forEach((combineLog: PersistenceLogEntity) => {
              this._uploadTaskQueueLoop.addTail(
                new UploadPersistenceLogTask(
                  combineLog,
                  this._logUploader,
                  this._logPersistence,
                ),
              );
            });
            this._persistenceFSM.consume();
          } else {
            if (this._persistenceFSM.state === PERSISTENCE_STATE.NOT_EMPTY) {
              this._persistenceFSM.consume();
            }
          }
        }),
      );
    }
  }

  private _combinePersistenceLogs(persistenceLogs: PersistenceLogEntity[]) {
    const combineLogs = [];
    let size = 0;
    for (let i = 0; i < persistenceLogs.length; i++) {
      size += persistenceLogs[i].size || 0;
      const currentLog = combineLogs[combineLogs.length - 1];
      if (!currentLog) {
        combineLogs.push(cloneDeep(persistenceLogs[i]));
      } else if (
        size > configManager.getConfig().consumer.combineSizeThreshold ||
        currentLog.sessionId !== persistenceLogs[i].sessionId
      ) {
        combineLogs.push(cloneDeep(persistenceLogs[i]));
        size = persistenceLogs[i].size || 0;
      } else {
        // combine
        currentLog.size = size;
        currentLog.logs = currentLog.logs.concat(persistenceLogs[i].logs);
        currentLog.endTime = persistenceLogs[i].endTime;
      }
    }
    return combineLogs;
  }

  private _uploadAvailable(): boolean {
    const {
      uploadAccessor,
      consumer: { uploadQueueLimit, enabled },
    } = configManager.getConfig();
    do {
      if (!enabled) break;
      if (this._flushMode) break;
      if (uploadAccessor && !uploadAccessor.isAccessible()) break;
      if (this._uploadTaskQueueLoop.size() >= uploadQueueLimit) break;
      if (!this._uploadTaskQueueLoop.isAvailable()) break;
      return true;
    } while (true);
    return false;
  }
}
