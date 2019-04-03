import { LogConsumer } from '../LogConsumer';
import {
  logEntityFactory,
  persistenceLogFactory,
  logConfigFactory,
  consumerConfigFactory,
} from '../../__tests__/factory';
import { ILogUploader } from '../api';
import { LogPersistence, PersistenceLogEntity } from '../persistence';
import { configManager } from '../../config';
import { Task } from '../task';
import { LogEntity } from '../../types';
jest.mock('../persistence');
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
  let mockLogPersistence;
  let mockApi;
  let [callback, observer] = createCallbackObserver();
  describe('onLog()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
      const persistenceLogsStore: PersistenceLogEntity[] = [];
      mockLogPersistence = new LogPersistence();
      mockLogPersistence.init = jest.fn();
      mockLogPersistence.count = jest.fn();
      mockLogPersistence.getAll = jest.fn();
      mockLogPersistence.put = jest.fn();
      mockLogPersistence.delete = jest.fn();
      mockLogPersistence.bulkPut = jest.fn();
      mockLogPersistence.bulkDelete = jest.fn();

      mockLogPersistence.put.mockImplementation(
        async (persistenceLog: PersistenceLogEntity) => {
          persistenceLogsStore.push(persistenceLog);
        },
      );
      mockLogPersistence.bulkPut.mockImplementation(
        async (persistenceLogs: PersistenceLogEntity[]) => {
          persistenceLogs.forEach(item => {
            persistenceLogsStore.push(item);
          });
        },
      );
      const deleteItem = (persistenceLog: PersistenceLogEntity) => {
        const index = persistenceLogsStore.findIndex(
          item => item.id === persistenceLog.id,
        );
        if (index > -1) {
          persistenceLogsStore.splice(index, 1);
        }
      };
      mockLogPersistence.delete.mockImplementation(
        async (persistenceLog: PersistenceLogEntity) => {
          deleteItem(persistenceLog);
        },
      );
      mockLogPersistence.bulkDelete.mockImplementation(
        async (persistenceLogs: PersistenceLogEntity[]) => {
          for (let index = 0; index < persistenceLogs.length; index++) {
            deleteItem(persistenceLogs[index]);
          }
        },
      );
      mockLogPersistence.count.mockImplementation(async () => {
        return persistenceLogsStore.length;
      });
      mockLogPersistence.getAll.mockImplementation(async limit => {
        return persistenceLogsStore.slice(0, limit).filter(item => !!item);
      });

      mockApi = new MockApi();
      mockApi.upload = jest.fn();

      [callback, observer] = createCallbackObserver();

      configManager.setConfig(
        logConfigFactory.build({
          logUploader: mockApi,
          uploadAccessor: {
            isAccessible: jest.fn().mockReturnValue(true),
            subscribe: jest.fn(),
          },
          consumer: consumerConfigFactory.build({
            enabled: true,
            uploadQueueLimit: 10,
            memoryCountThreshold: 10,
          }),
        }),
      );
    });
    it('should write into memory after log process done [JPT-537]', async () => {
      const logConsumer = new LogConsumer();
      const mockLog = logEntityFactory.build();
      logConsumer.setLogPersistence(mockLogPersistence);
      // memoryQueue is empty
      expect(logConsumer['_memoryQueue'].size()).toEqual(0);
      logConsumer.onLog(mockLog);
      // write into memory, memoryQueue add one
      expect(logConsumer['_memoryQueue'].peekHead()).toEqual(mockLog);
    });

    it('When network working but work queue is full, log should write into DB cache [JPT-545]', async () => {
      configManager.mergeConfig({
        consumer: consumerConfigFactory.build({
          enabled: true,
          uploadQueueLimit: 2,
          memoryCountThreshold: 0, // set to 0 to flush immediately while onLog
        }),
      });
      const logConsumer = new LogConsumer();
      // mockLogPersistence.count.mockReturnValue(0); // no data in DB
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      logConsumer.setLogPersistence(mockLogPersistence);
      logConsumer['_persistenceTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer; // wait for persistenceTaskQueue done
      expect(mockLogPersistence.count).toBeCalled();
      // prepare fill uploadTaskQueue to full
      for (let i = 0; i < 2; i++) {
        expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(i);
        logConsumer.onLog(logEntityFactory.build());
        expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(i + 1);
        expect(logConsumer['_persistenceTaskQueueLoop'].size()).toEqual(0);
      }

      // uploadTaskQueue is full now
      logConsumer.onLog(logEntityFactory.build());

      // will add to persistenceTaskQueue
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistenceTaskQueueLoop'].size()).toEqual(1);

      // will add to persistenceTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistenceTaskQueueLoop'].size()).toEqual(2);
      // clear
      logConsumer['_uploadTaskQueueLoop'].abortAll();
      logConsumer['_persistenceTaskQueueLoop'].abortAll();
    });

    it('When work queue and network is not working neither, log should write into DB cache [JPT-546]', async () => {
      configManager.mergeConfig({
        uploadAccessor: {
          isAccessible: jest.fn().mockReturnValue(false), // network is not working
          subscribe: jest.fn(),
        },
        consumer: consumerConfigFactory.build({
          enabled: true,
          uploadQueueLimit: 2,
          memoryCountThreshold: 0, // set to 0 to flush immediately while onLog
        }),
      });
      const logConsumer = new LogConsumer();
      // mockLogPersistence.count.mockReturnValue(0);
      [callback, observer] = createCallbackObserver();
      logConsumer.setLogPersistence(mockLogPersistence);
      logConsumer['_persistenceTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;

      // mock uploadTaskQueue to full
      logConsumer['_uploadTaskQueueLoop'].addTail(new Task());
      logConsumer['_uploadTaskQueueLoop'].addTail(new Task());

      let taskQueueSize = logConsumer['_persistenceTaskQueueLoop'].size();
      // will add to persistenceTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistenceTaskQueueLoop'].size()).toEqual(
        ++taskQueueSize,
      );

      // will add to persistenceTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistenceTaskQueueLoop'].size()).toEqual(
        ++taskQueueSize,
      );
      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistenceTaskQueueLoop'].peekAll();
    });

    it('When work queue is working but network is not working, log should write into DB cache [JPT-547]', async () => {
      configManager.mergeConfig({
        uploadAccessor: {
          isAccessible: jest.fn().mockReturnValue(false), // network is not working
          subscribe: jest.fn(),
        },
        consumer: consumerConfigFactory.build({
          enabled: true,
          uploadQueueLimit: 10,
          memoryCountThreshold: 0, // set to 0 to flush immediately while onLog
        }),
      });
      const logConsumer = new LogConsumer();
      // mockLogPersistence.count.mockReturnValue(0);
      logConsumer.setLogPersistence(mockLogPersistence);
      logConsumer['_persistenceTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;
      expect(mockLogPersistence.count).toBeCalled();

      // will add to persistenceTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      expect(logConsumer['_persistenceTaskQueueLoop'].size()).toEqual(1);

      // will add to persistenceTaskQueue
      logConsumer.onLog(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      expect(logConsumer['_persistenceTaskQueueLoop'].size()).toEqual(2);
      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistenceTaskQueueLoop'].peekAll();
    });

    it('DB cache log data should upload by network when db cache init [JPT-548]', async () => {
      const logConsumer = new LogConsumer();
      const mockPersistenceLogs = persistenceLogFactory.buildList(10);
      // mock DB cache data
      await mockLogPersistence.bulkPut(mockPersistenceLogs);
      let uploadLogs = [];
      mockApi.upload.mockImplementation(async (logs: LogEntity[]) => {
        uploadLogs = uploadLogs.concat(logs);
      });
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      logConsumer.setLogPersistence(mockLogPersistence);
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;
      expect(mockLogPersistence.count).toBeCalled();
      expect(mockLogPersistence.getAll).toBeCalled();
      // expect(mockApi.upload).toBeCalledTimes(mockPersistenceLogs.length);
      expect(mockLogPersistence.bulkDelete).lastCalledWith(mockPersistenceLogs);

      // should upload all logs from DB cache
      let persistenceLogs = [];
      mockPersistenceLogs.forEach(({ logs }) => {
        persistenceLogs = persistenceLogs.concat(logs);
      });
      expect(uploadLogs).toEqual(persistenceLogs);
      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistenceTaskQueueLoop'].peekAll();
    });

    it('DB cache log data should upload by network if work queue is empty or not block [JPT-549]', async () => {
      const mockAccessor = {
        networkAccessible: true,
      };
      configManager.setConfig(
        logConfigFactory.build({
          logUploader: mockApi,
          uploadAccessor: {
            isAccessible: () => mockAccessor.networkAccessible,
            subscribe: jest.fn(),
          },
          consumer: consumerConfigFactory.build({
            enabled: true,
            uploadQueueLimit: 4,
            memoryCountThreshold: 0,
          }),
        }),
      );
      const logConsumer = new LogConsumer();
      const logs = logEntityFactory.buildList(3);
      const rawOnLoopCompleted =
        logConsumer['_uploadTaskQueueLoop']['_onLoopCompleted'];
      const [callback1, observer1] = createCallbackObserver();
      logConsumer['_persistenceTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback1();
      });
      logConsumer.setLogPersistence(mockLogPersistence);
      // waite init check
      await observer1;
      // net not busy, to net queue
      mockAccessor.networkAccessible = true;
      logConsumer.onLog(logs[0]);
      logConsumer.onLog(logs[1]);
      // net busy, to DB queue
      mockAccessor.networkAccessible = false;
      logConsumer.onLog(logs[2]);
      mockAccessor.networkAccessible = true;
      // wait net loop completed
      const [callback2, observer2] = createCallbackObserver();
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        await rawOnLoopCompleted();
        callback2();
      });
      await observer2;
      expect(mockApi.upload).toHaveBeenNthCalledWith(1, [logs[0]]);
      expect(mockApi.upload).toHaveBeenNthCalledWith(2, [logs[1]]);
      expect(mockApi.upload).toBeCalledTimes(2);
      const [callback3, observer3] = createCallbackObserver();
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        await rawOnLoopCompleted();
        callback3();
      });
      // wait next net loop, expect DB log has been upload
      await observer3;
      expect(mockApi.upload).toHaveBeenNthCalledWith(3, [logs[2]]);
      expect(mockApi.upload).toBeCalledTimes(3);

      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistenceTaskQueueLoop'].peekAll();
    });

    it('When uploading not complete, network error occur, log should write into DB cache [JPT-550]', async () => {
      configManager.setConfig(
        logConfigFactory.build({
          logUploader: mockApi,
          uploadAccessor: {
            isAccessible: jest.fn().mockReturnValue(true),
            subscribe: jest.fn(),
          },
          consumer: consumerConfigFactory.build({
            enabled: true,
            uploadQueueLimit: 10,
            memoryCountThreshold: 0,
          }),
        }),
      );
      const logConsumer = new LogConsumer();
      // mock network error
      mockApi.upload.mockRejectedValue(new Error('abort error'));
      mockApi.errorHandler.mockReturnValue('abortAll');
      logConsumer.setLogPersistence(mockLogPersistence);
      logConsumer['_persistenceTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      expect(mockLogPersistence.put).toHaveBeenCalledTimes(0);
      // waite init check
      await observer;
      [callback, observer] = createCallbackObserver();

      logConsumer.onLog(logEntityFactory.build());
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;
      // have try to upload
      expect(mockApi.upload).toHaveBeenCalledTimes(1);
      // should write to DB cache
      expect(mockLogPersistence.put).toHaveBeenCalledTimes(1);

      // clear
      logConsumer['_uploadTaskQueueLoop'].peekAll();
      logConsumer['_persistenceTaskQueueLoop'].peekAll();
    });
  });
  describe('_uploadAvailable()', () => {
    it('should uploadAvailable falsy when disable consumer', () => {
      const logConsumer = new LogConsumer();
      configManager.mergeConfig({
        consumer: consumerConfigFactory.build({
          enabled: true,
          uploadQueueLimit: 10,
        }),
      });
      expect(logConsumer['_uploadAvailable']()).toBeTruthy();
      configManager.mergeConfig({
        consumer: consumerConfigFactory.build({
          enabled: false,
          uploadQueueLimit: 10,
        }),
      });
      expect(logConsumer['_uploadAvailable']()).toBeFalsy();
    });
    it('should uploadAvailable falsy when disable uploadAccessor', () => {
      const logConsumer = new LogConsumer();
      const uploadAccessor = {
        isAccessible: jest.fn().mockReturnValue(true),
        subscribe: jest.fn(),
      };
      configManager.mergeConfig({
        uploadAccessor,
        consumer: consumerConfigFactory.build({
          enabled: true,
          uploadQueueLimit: 10,
        }),
      });
      expect(logConsumer['_uploadAvailable']()).toBeTruthy();
      uploadAccessor.isAccessible.mockReturnValue(false);
      expect(logConsumer['_uploadAvailable']()).toBeFalsy();
    });
  });
});
