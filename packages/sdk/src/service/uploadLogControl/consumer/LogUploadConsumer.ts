/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogConsumer, LogEntity } from 'foundation/src/log/types';
import { ILogUploader } from './uploader';
import { Task, MemoryQueue, TaskQueueLoop } from './task';
import { PersistentLogEntity, ILogPersistent } from './persistent';
import StateMachine from 'ts-javascript-state-machine';
import { configManager } from './config';
import { randomInt, sleep } from './utils';
import sumBy from 'lodash/sumBy';
import cloneDeep from 'lodash/cloneDeep';
import { IAccessor } from './types';

const PERSISTENT_STATE = {
  INIT: 'INIT',
  NO_SURE: 'NO_SURE',
  NOT_EMPTY: 'NOT_EMPTY',
  EMPTY: 'EMPTY',
};

class PersistentTask extends Task {}
class UploadMemoryLogTask extends Task {
  constructor(
    public logs: LogEntity[],
    public _logUploader: ILogUploader,
    public _logPersistent: ILogPersistent,
  ) {
    super();
    this.setOnExecute(async () => await _logUploader.upload(logs));
    this.setOnAbort(async () => {
      await _logPersistent.put(transform.toPersistent(logs));
    });
  }
}
class UploadPersistentLogTask extends Task {
  constructor(
    public log: PersistentLogEntity,
    public _logUploader: ILogUploader,
    public _logPersistent: ILogPersistent,
  ) {
    super();
    this.setOnExecute(
      async () => await _logUploader.upload(transform.toLogEntity(log)),
    );
    this.setOnCompleted(async () => await _logPersistent.delete(log));
    this.setOnAbort(async () => {
      await _logPersistent.put(log);
    });
  }
}

const transform = {
  toPersistent: (logEntities: LogEntity[]): PersistentLogEntity => {
    const target: PersistentLogEntity = {
      id: randomInt(),
      sessionId: logEntities[0].sessionId,
      startTime: logEntities[0].timestamp,
      endTime: logEntities[logEntities.length - 1].timestamp,
      logs: logEntities,
      size: sumBy(logEntities, log => log.size),
    };
    return target;
  },
  toLogEntity: (persistentLog: PersistentLogEntity): LogEntity[] => {
    return persistentLog.logs;
  },
};

function retryDelay(retryCount: number) {
  return Math.min(5000 + retryCount * 20000, 60 * 1000);
}

export class LogConsumer implements ILogConsumer {
  private _persistentFSM: StateMachine;
  private _memoryQueue: MemoryQueue<LogEntity>;
  private _memorySize: number;
  private _uploadTaskQueueLoop: TaskQueueLoop;
  private _persistentTaskQueueLoop: TaskQueueLoop;
  private _timeoutId: NodeJS.Timeout;
  private _flushMode: boolean;

  constructor(
    private _logUploader: ILogUploader,
    private _logPersistent: ILogPersistent,
    private _uploadAccessor?: IAccessor,
  ) {
    this._memoryQueue = new MemoryQueue();
    this._memorySize = 0;
    this._flushMode = false;
    this._uploadTaskQueueLoop = new TaskQueueLoop()
      .setOnTaskError(async (task, error, loopController) => {
        const handlerType = this._logUploader.errorHandler(error);
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
        this._consumePersistentIfNeed();
      });
    this._persistentTaskQueueLoop = new TaskQueueLoop();
    this._persistentFSM = new StateMachine({
      init: PERSISTENT_STATE.INIT,
      transitions: [
        {
          name: 'initial',
          from: PERSISTENT_STATE.INIT,
          to: PERSISTENT_STATE.NO_SURE,
        },
        {
          name: 'ensureEmpty',
          from: PERSISTENT_STATE.NO_SURE,
          to: PERSISTENT_STATE.EMPTY,
        },
        {
          name: 'ensureNotEmpty',
          from: PERSISTENT_STATE.NO_SURE,
          to: PERSISTENT_STATE.NOT_EMPTY,
        },
        {
          name: 'consume',
          from: PERSISTENT_STATE.NOT_EMPTY,
          to: PERSISTENT_STATE.EMPTY,
        },
        {
          name: 'append',
          from: PERSISTENT_STATE.EMPTY,
          to: PERSISTENT_STATE.NOT_EMPTY,
        },
      ],
      methods: {
        onInitial: () => {
          this._ensurePersistentState();
        },
        onEnsureEmpty: () => {},
        onEnsureNotEmpty: () => {
          this._consumePersistentIfNeed();
        },
        onConsume: () => {
          this._consumePersistentIfNeed();
        },
        onAppend: () => {
          this._consumePersistentIfNeed();
        },
      },
    });
    this._persistentFSM.initial();
    this._flushInTimeout();
  }

  async onLog(logEntity: LogEntity): Promise<void> {
    this._memoryQueue.addTail(logEntity);
    this._memorySize += logEntity.size;
    const {
      memoryCountThreshold,
      memorySizeThreshold,
    } = configManager.getConfig();
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

  public setLogPersistent(logPersistent: ILogPersistent) {
    this._logPersistent = logPersistent;
  }

  public setUploadAccessor(uploadAccessor: IAccessor) {
    this._uploadAccessor = uploadAccessor;
  }

  private _flushInTimeout() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
    }
    this._timeoutId = setTimeout(() => {
      this._consumePersistentIfNeed();
      this._flushMemory();
    },                           configManager.getConfig().autoFlushTimeCycle);
  }

  private _flushMemory() {
    const logs = this._memoryQueue.peekAll();
    this._memorySize = 0;
    this._flushInTimeout();
    if (logs.length < 1) return;
    if (
      this._persistentFSM.state === PERSISTENT_STATE.EMPTY &&
      this._uploadAvailable()
    ) {
      this._uploadTaskQueueLoop.addTail(
        new UploadMemoryLogTask(logs, this._logUploader, this._logPersistent),
      );
    } else {
      this._persistentTaskQueueLoop.addTail(
        new PersistentTask() // cache task
          .setOnExecute(async () => {
            await this._logPersistent.put(transform.toPersistent(logs));
            if (this._persistentFSM.state !== PERSISTENT_STATE.NOT_EMPTY) {
              this._persistentFSM.append();
            }
          }),
      );
    }
  }

  private _ensurePersistentState() {
    this._persistentTaskQueueLoop.addTail(
      new PersistentTask().setOnExecute(async () => {
        const count = await this._logPersistent.count();
        if (this._persistentFSM.state === PERSISTENT_STATE.NO_SURE) {
          count
            ? this._persistentFSM.ensureNotEmpty()
            : this._persistentFSM.ensureEmpty();
        }
      }),
    );
  }

  private _consumePersistentIfNeed() {
    const { uploadQueueLimit } = configManager.getConfig();
    if (this._uploadTaskQueueLoop.size() === 0 && this._uploadAvailable()) {
      this._persistentTaskQueueLoop.addTail(
        new PersistentTask().setOnExecute(async () => {
          const persistentLogs = await this._logPersistent.getAll(
            3 * uploadQueueLimit,
          );
          if (persistentLogs && persistentLogs.length) {
            await this._logPersistent.bulkDelete(persistentLogs);
            const combineLogs = this._combinePersistentLogs(persistentLogs);
            combineLogs.forEach((combineLog: PersistentLogEntity) => {
              this._uploadTaskQueueLoop.addTail(
                new UploadPersistentLogTask(
                  combineLog,
                  this._logUploader,
                  this._logPersistent,
                ),
              );
            });
            this._persistentFSM.consume();
          } else {
            if (this._persistentFSM.state === PERSISTENT_STATE.NOT_EMPTY) {
              this._persistentFSM.consume();
            }
          }
        }),
      );
    }
  }

  private _combinePersistentLogs(persistentLogs: PersistentLogEntity[]) {
    const combineLogs = [];
    let size = 0;
    for (let i = 0; i < persistentLogs.length; i++) {
      size += persistentLogs[i].size || 0;
      const currentLog = combineLogs[combineLogs.length - 1];
      if (!currentLog) {
        combineLogs.push(cloneDeep(persistentLogs[i]));
      } else if (
        size > configManager.getConfig().combineSizeThreshold ||
        currentLog.sessionId !== persistentLogs[i].sessionId
      ) {
        combineLogs.push(cloneDeep(persistentLogs[i]));
        size = persistentLogs[i].size || 0;
      } else {
        // combine
        currentLog.size = size;
        currentLog.logs = currentLog.logs.concat(persistentLogs[i].logs);
        currentLog.endTime = persistentLogs[i].endTime;
      }
    }
    return combineLogs;
  }

  private _uploadAvailable(): boolean {
    const { uploadEnabled, uploadQueueLimit } = configManager.getConfig();
    do {
      if (!uploadEnabled) break;
      if (this._flushMode) break;
      if (this._uploadAccessor && !this._uploadAccessor.isAccessible()) break;
      if (this._uploadTaskQueueLoop.size() >= uploadQueueLimit) break;
      if (!this._uploadTaskQueueLoop.isAvailable()) break;
      return true;
    } while (true);
    return false;
  }
}
