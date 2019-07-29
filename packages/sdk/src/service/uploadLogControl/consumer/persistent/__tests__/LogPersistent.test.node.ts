/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:09:10
 * Copyright © RingCentral. All rights reserved.
 */
import Factory, { Builder } from 'factory.ts';
import { LogPersistent } from '../LogPersistent';
import { PersistentLogEntity } from '../types';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

const persistentLogBuilder: Builder<PersistentLogEntity> = {
  id: Factory.each(i => i),
  sessionId: 'x1',
  startTime: Factory.each(i => Date.now() + i * 600 * 1000),
  endTime: Factory.each(i => Date.now() + i * 1000 * 1000),
  logs: logEntityFactory.buildList(10),
  size: 1,
};

export const persistentLogFactory = Factory.makeFactory(persistentLogBuilder);

describe('LogPersistent', () => {
  describe('crud()', () => {
    it('crud', async () => {
      const mockLogs = persistentLogFactory.buildList(2);
      const logPersistent = new LogPersistent();
      expect(await logPersistent.count()).toEqual(0);
      await logPersistent.put(mockLogs[0]);
      await logPersistent.put(mockLogs[1]);
      expect(await logPersistent.count()).toEqual(2);
      const logs = await logPersistent.getAll(10);
      expect(logs).toEqual(mockLogs);
      await logPersistent.delete(mockLogs[0]);
      expect(await logPersistent.count()).toEqual(1);
      await logPersistent.bulkDelete([mockLogs[1]]);
      expect(await logPersistent.count()).toEqual(0);
      await logPersistent.bulkPut(mockLogs);
      expect(await logPersistent.count()).toEqual(2);
      expect(await logPersistent.get(mockLogs[0].id)).toEqual(mockLogs[0]);
      expect(await logPersistent.get(mockLogs[1].id)).toEqual(mockLogs[1]);
    });
  });
  describe('cleanPersistentWhenReachLimit()', () => {
    it('should delete logs to less than half of max size', async () => {
      const mockLogs = [
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }), // maxSize=10, halfMaxSize=5, delete to here
        persistentLogFactory.build({
          size: 3,
        }),
      ];
      const logPersistent = new LogPersistent();
      logPersistent.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistent.bulkDelete = jest.fn();
      await logPersistent.cleanPersistentWhenReachLimit(10);
      expect(logPersistent.bulkDelete).toBeCalledWith(mockLogs.slice(0, 3 + 1));
    });
    it('should delete logs to less than half of max size', async () => {
      const mockLogs = [
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }), // maxSize=10, halfMaxSize=5, delete to here
        persistentLogFactory.build({
          size: 2,
        }),
        persistentLogFactory.build({
          size: 3,
        }),
      ];
      const logPersistent = new LogPersistent();
      logPersistent.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistent.bulkDelete = jest.fn();
      await logPersistent.cleanPersistentWhenReachLimit(10);
      expect(logPersistent.bulkDelete).toBeCalledWith(mockLogs.slice(0, 2 + 1));
    });
    it('should delete logs to less than half of max size', async () => {
      const mockLogs = [
        persistentLogFactory.build({
          size: 11,
        }), // maxSize=10, halfMaxSize=5, delete to here
      ];
      const logPersistent = new LogPersistent();
      logPersistent.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistent.bulkDelete = jest.fn();
      await logPersistent.cleanPersistentWhenReachLimit(10);
      expect(logPersistent.bulkDelete).toBeCalledWith(mockLogs);
    });
    it('should now broke when getAll() === null', async () => {
      const logPersistent = new LogPersistent();
      logPersistent.getAll = jest.fn().mockResolvedValue(null);
      logPersistent.bulkDelete = jest.fn();
      await logPersistent.cleanPersistentWhenReachLimit(10);
      expect(logPersistent.cleanPersistentWhenReachLimit).not.toThrow();
      expect(logPersistent.bulkDelete).not.toBeCalled();
    });
    it('should delete all logs when maxPersistentSize === 0', async () => {
      const mockLogs = [
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }),
        persistentLogFactory.build({
          size: 3,
        }), // maxSize=0, halfMaxSize=0, delete to here
      ];
      const logPersistent = new LogPersistent();
      logPersistent.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistent.bulkDelete = jest.fn();
      await logPersistent.cleanPersistentWhenReachLimit(0);
      expect(logPersistent.bulkDelete).toBeCalledWith(mockLogs);
    });
  });
});
