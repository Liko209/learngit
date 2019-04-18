/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:09:16
 * Copyright © RingCentral. All rights reserved.
 */
import { LogUploadConsumer } from '../LogUploadConsumer';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';
import { persistentLogFactory } from '../persistent/__tests__/LogPersistent.test';
import { ILogUploader } from '../uploader/types';
import { LogMemoryPersistent, ILogPersistent } from '../persistent';
import { configManager } from '../../config';
import { Task } from '../task';
import { LogEntity } from 'foundation';
import { ILogProducer } from '../../collectors/types';
import { spyOnTarget } from 'sdk/__tests__/utils';
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
  let mockLogPersistent: ILogPersistent;
  let mockUploader: ILogUploader;
  let mockLogProducer: ILogProducer;

  const mockAccessor = {
    isAccessible: jest.fn().mockReturnValue(false), // network is not working
    subscribe: jest.fn(),
  };
  let [callback, observer] = createCallbackObserver();
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    // const persistentLogsStore: PersistentLogEntity[] = [];
    mockLogPersistent = spyOnTarget(
      new LogMemoryPersistent(Number.MAX_SAFE_INTEGER),
    );
    mockLogProducer = spyOnTarget<ILogProducer>({
      produce: (size?: number) => {
        return [];
      },
    });
    mockUploader = new MockApi();
    mockUploader.upload = jest.fn();

    [callback, observer] = createCallbackObserver();
  });
  describe('onLog()', () => {
    it('should write into memory after log process done [JPT-537]', async () => {
      const logConsumer = new LogUploadConsumer(
        mockLogProducer,
        mockUploader,
        mockLogPersistent,
      );
      const mockLog = logEntityFactory.build();
      // memoryQueue is empty
      expect(logConsumer['_memoryQueue'].size()).toEqual(0);
      logConsumer.consume(mockLog);
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
        mockLogProducer,
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
        logConsumer.consume(logEntityFactory.build());
        expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(i + 1);
        expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(0);
      }

      // uploadTaskQueue is full now
      logConsumer.consume(logEntityFactory.build());

      // will add to persistentTaskQueue
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(1);

      // will add to persistentTaskQueue
      logConsumer.consume(logEntityFactory.build());
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
        mockLogProducer,
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
      logConsumer.consume(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(2);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(
        ++taskQueueSize,
      );

      // will add to persistentTaskQueue
      logConsumer.consume(logEntityFactory.build());
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
        mockLogProducer,
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      [callback, observer] = createCallbackObserver();
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      await observer;
      expect(mockLogPersistent.count).toBeCalled();

      // will add to persistentTaskQueue
      logConsumer.consume(logEntityFactory.build());
      expect(logConsumer['_uploadTaskQueueLoop'].size()).toEqual(0);
      expect(logConsumer['_persistentTaskQueueLoop'].size()).toEqual(1);

      // will add to persistentTaskQueue
      logConsumer.consume(logEntityFactory.build());
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
        mockLogProducer,
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
        mockLogProducer,
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      const logs = logEntityFactory.buildList(3);
      const rawOnLoopCompleted =
        logConsumer['_uploadTaskQueueLoop']['onLoopCompleted'];
      const [onPersistentLoopEnd, persistentLoop] = createCallbackObserver();
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        onPersistentLoopEnd();
      });
      // waite init check
      await persistentLoop;
      // net not busy, to net queue
      mockAccessor.isAccessible.mockReturnValue(true);
      logConsumer.consume(logs[0]);
      logConsumer.consume(logs[1]);
      // net busy, to DB queue
      mockAccessor.isAccessible.mockReturnValue(false);
      logConsumer.consume(logs[2]);
      mockAccessor.isAccessible.mockReturnValue(true);
      // wait net loop completed
      const [onUploadLoopEnd, uploadLoop] = createCallbackObserver();
      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        await rawOnLoopCompleted();
        onUploadLoopEnd();
      });
      await uploadLoop;
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
      (mockLogPersistent.count as jest.Mock).mockResolvedValue(0);
      const logConsumer = new LogUploadConsumer(
        mockLogProducer,
        mockUploader,
        mockLogPersistent,
        mockAccessor,
      );
      // mock network error
      mockUploader.upload.mockRejectedValue(new Error('abort error'));
      mockUploader.errorHandler.mockReturnValue('abort');
      logConsumer['_persistentTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      // logConsumer.onLog(logEntityFactory.build());
      // expect(mockLogPersistent.put).toHaveBeenCalledTimes(0);
      // waite init check
      await observer;
      [callback, observer] = createCallbackObserver();

      logConsumer['_uploadTaskQueueLoop'].setOnLoopCompleted(async () => {
        callback();
      });
      logConsumer.consume(logEntityFactory.build());
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
