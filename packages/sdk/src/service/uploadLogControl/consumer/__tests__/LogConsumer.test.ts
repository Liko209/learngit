/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:09:16
 * Copyright © RingCentral. All rights reserved.
 */
import { LogUploadConsumer } from '../LogUploadConsumer';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';
import { persistentLogFactory } from '../persistent/__tests__/LogPersistent.test';
import { ILogUploader } from '../uploader/types';
import { LogPersistent, PersistentLogEntity } from '../persistent';
import { configManager } from '../config';
import { Task } from '../task';
import { LogEntity } from 'foundation';
jest.mock('../persistent');
class MockApi implements ILogUploader {
  upload = jest.fn();
  errorHandler = jest.fn();
}

const createCallbackObserver = (): [Function, Promise<any>] => {
  let callback = () => {};
  let called = false;
  const observer = new Promise(resolve => {
    callback = async () => {
      !called && (await resolve());
      called = true;
    };
  });
  return [callback, observer];
};

describe('LogConsumer', () => {
  let mockLogPersistent: LogPersistent;
  let mockUploader: ILogUploader;
  const mockAccessor = {
    isAccessible: jest.fn().mockReturnValue(false), // network is not working
    subscribe: jest.fn(),
  };
  let [callback, observer] = createCallbackObserver();
  describe('onLog()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
      const persistentLogsStore: PersistentLogEntity[] = [];
      mockLogPersistent = new LogPersistent();
      // mockLogPersistent.init = jest.fn();
      mockLogPersistent.count = jest.fn();
      mockLogPersistent.getAll = jest.fn();
      mockLogPersistent.put = jest.fn();
      mockLogPersistent.delete = jest.fn();
      mockLogPersistent.bulkPut = jest.fn();
      mockLogPersistent.bulkDelete = jest.fn();

      mockLogPersistent.put.mockImplementation(
        async (persistentLog: PersistentLogEntity) => {
          persistentLogsStore.push(persistentLog);
        },
      );
      mockLogPersistent.bulkPut.mockImplementation(
        async (persistentLogs: PersistentLogEntity[]) => {
          persistentLogs.forEach((item: PersistentLogEntity) => {
            persistentLogsStore.push(item);
          });
        },
      );
      const deleteItem = (persistentLog: PersistentLogEntity) => {
        const index = persistentLogsStore.findIndex(
          item => item.id === persistentLog.id,
        );
        if (index > -1) {
          persistentLogsStore.splice(index, 1);
        }
      };
      mockLogPersistent.delete.mockImplementation(
        async (persistentLog: PersistentLogEntity) => {
          deleteItem(persistentLog);
        },
      );
      mockLogPersistent.bulkDelete.mockImplementation(
        async (persistentLogs: PersistentLogEntity[]) => {
          for (let index = 0; index < persistentLogs.length; index++) {
            deleteItem(persistentLogs[index]);
          }
        },
      );
      mockLogPersistent.count.mockImplementation(async () => {
        return persistentLogsStore.length;
      });
      mockLogPersistent.getAll.mockImplementation(async (limit?: number) => {
        return limit === undefined
          ? persistentLogsStore
          : persistentLogsStore.slice(0, limit).filter(item => !!item);
      });

      mockUploader = new MockApi();
      mockUploader.upload = jest.fn();

      [callback, observer] = createCallbackObserver();
    });
    it('should write into memory after log process done [JPT-537]', async () => {
      const logConsumer = new LogUploadConsumer(mockUploader, mockLogPersistent);
      const mockLog = logEntityFactory.build();
      // todo logConsumer.setLogPersistent(mockLogPersistent);
      // memoryQueue is empty
      expect(logConsumer['_memoryQueue'].size()).toEqual(0);
      logConsumer.onLog(mockLog);
      // write into memory, memoryQueue add one
      expect(logConsumer['_memoryQueue'].peekHead()).toEqual(mockLog);
    });

    it('When network working but work queue is full, log should write into DB cache [JPT-545]', async () => {
      configManager.mergeConfig({
        uploadEnabled: true,
        uploadQueueLimit: 2,
        memoryCountThreshold: 0,
      });
      mockAccessor.isAccessible.mockReturnValue(true);
      const logConsumer = new LogUploadConsumer(
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      // mockLogPersistent.count.mockReturnValue(0); // no data in DB
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer; // wait for persistentTaskQueue done
      expect(mockLogPersistent.count).toBeCalled();
      // prepare fill uploadTaskQueue to full
      for (let i = 0; i < 2; i++) {
        expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(i);
        logConsumer.onLog(logEntityFactory.build());
        expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(i + 1);
        expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(0);
      }

      // uploadTaskQueue is full now
      logConsumer.onLog(logEntityFactory.build());

      // will add to persistentTaskQueue
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(1);

      // will add to persistentTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(2);
      // clear
      logConsumer['_uploadTaskQueueLoop'].abortAll();
      logConsumer['_persistentTaskQueueLoop'].abortAll();
    });

    it('When work queue and network is not working neither, log should write into DB cache [JPT-546]', async () => {
      configManager.mergeConfig({
        uploadEnabled: true,
        uploadQueueLimit: 2,
        memoryCountThreshold: 0, // set to 0 to flush immediately while onLog
      });
      mockAccessor.isAccessible.mockReturnValue(false);
      // network is not working
      const logConsumer = new LogUploadConsumer(
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      // mockLogPersistent.count.mockReturnValue(0);
      [callback, observer] = createCallbackObserver();
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;

      // mock uploadTaskQueue to full
      logConsumer['_uploadTaskQueueLoop'].addTail(new Task());
      logConsumer['_uploadTaskQueueLoop'].addTail(new Task());

      let taskQueueSize = logConsumer['_persistentTaskQueueLoop'].size();
      // will add to persistentTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(
        ++taskQueueSize,
      );

      // will add to persistentTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(
        ++taskQueueSize,
      );
      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistentTaskQueueLoop'].peekAll();
    });

    it('When work queue is working but network is not working, log should write into DB cache [JPT-547]', async () => {
      configManager.mergeConfig({
        uploadEnabled: true,
        uploadQueueLimit: 10,
        memoryCountThreshold: 0, // set to 0 to flush immediately while onLog
      });
      mockAccessor.isAccessible.mockReturnValue(false);
      const logConsumer = new LogUploadConsumer(
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      // mockLogPersistent.count.mockReturnValue(0);
      logConsumer.setLogPersistent(mockLogPersistent);
      [callback, observer] = createCallbackObserver();
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;
      expect(mockLogPersistent.count).toBeCalled();

      // will add to persistentTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(1);

      // will add to persistentTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(2);
      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistentTaskQueueLoop'].peekAll();
    });

    it('DB cache log data should upload by network when db cache init [JPT-548]', async () => {
      configManager.mergeConfig({
        uploadEnabled: true,
        uploadQueueLimit: 10,
        memoryCountThreshold: 0, // set to 0 to flush immediately while onLog
      });
      mockAccessor.isAccessible.mockReturnValue(true);
      const mockPersistentLogs = persistentLogFactory.buildList(10);
      // mock DB cache data
      await mockLogPersistent.bulkPut(mockPersistentLogs);
      let uploadLogs: LogEntity[] = [];
      mockUploader.upload.mockImplementation(async (logs: LogEntity[]) => {
        uploadLogs = uploadLogs.concat(logs);
      });
      // expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      [callback, observer] = createCallbackObserver();
      const logConsumer = new LogUploadConsumer(
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;
      expect(mockLogPersistent.count).toBeCalled();
      expect(mockLogPersistent.getAll).toBeCalled();
      // expect(mockApi.upload).toBeCalledTimes(mockPersistentLogs.length);
      expect(mockLogPersistent.bulkDelete).lastCalledWith(mockPersistentLogs);

      // should upload all logs from DB cache
      let persistentLogs: LogEntity[] = [];
      mockPersistentLogs.forEach(({ logs }) => {
        persistentLogs = persistentLogs.concat(logs);
      });
      expect(uploadLogs).toEqual(persistentLogs);
      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistentTaskQueueLoop'].peekAll();
    });

    it('DB cache log data should upload by network if work queue is empty or not block [JPT-549]', async () => {
      configManager.mergeConfig({
        uploadEnabled: true,
        uploadQueueLimit: 4,
        memoryCountThreshold: 0,
      });
      mockAccessor.isAccessible.mockReturnValue(true);
      const logConsumer = new LogUploadConsumer(
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      const logs = logEntityFactory.buildList(3);
      const rawOnLoopCompleted =
        logConsumer['_uploadTaskQueueLoop']['_onLoopCompleted'];
      const [callback1, observer1] = createCallbackObserver();
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback1();
      });
      logConsumer.setLogPersistent(mockLogPersistent);
      // waite init check
      await observer1;
      // net not busy, to net queue
      mockAccessor.isAccessible.mockReturnValue(true);
      logConsumer.onLog(logs[0]);
      logConsumer.onLog(logs[1]);
      // net busy, to DB queue
      mockAccessor.isAccessible.mockReturnValue(false);
      logConsumer.onLog(logs[2]);
      mockAccessor.isAccessible.mockReturnValue(true);
      // wait net loop completed
      const [callback2, observer2] = createCallbackObserver();
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        await rawOnLoopCompleted();
        callback2();
      });
      await observer2;
      expect(mockUploader.upload).toHaveBeenNthCalledWith(1, [logs[0]]);
      expect(mockUploader.upload).toHaveBeenNthCalledWith(2, [logs[1]]);
      expect(mockUploader.upload).toBeCalledTimes(2);
      const [callback3, observer3] = createCallbackObserver();
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        await rawOnLoopCompleted();
        callback3();
      });
      // wait next net loop, expect DB log has been upload
      await observer3;
      expect(mockUploader.upload).toHaveBeenNthCalledWith(3, [logs[2]]);
      expect(mockUploader.upload).toBeCalledTimes(3);

      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistentTaskQueueLoop'].peekAll();
    });

    it('When uploading not complete, network error occur, log should write into DB cache [JPT-550]', async () => {
      configManager.mergeConfig({
        uploadEnabled: true,
        uploadQueueLimit: 10,
        memoryCountThreshold: 0,
      });
      mockAccessor.isAccessible.mockReturnValue(true);
      const logConsumer = new LogUploadConsumer(
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      // mock network error
      mockUploader.upload.mockRejectedValue(new Error('abort error'));
      mockUploader.errorHandler.mockReturnValue('abortAll');
      logConsumer.setLogPersistent(mockLogPersistent);
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      expect(mockLogPersistent.put).toHaveBeenCalledTimes(0);
      // waite init check
      await observer;
      [callback, observer] = createCallbackObserver();

      logConsumer.onLog(logEntityFactory.build());
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;
      // have try to upload
      expect(mockUploader.upload).toHaveBeenCalledTimes(1);
      // should write to DB cache
      expect(mockLogPersistent.put).toHaveBeenCalledTimes(1);

      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistentTaskQueueLoop'].peekAll();
    });
  });
});
