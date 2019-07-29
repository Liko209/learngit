/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 09:42:48
 * Copyright © RingCentral. All rights reserved.
 */
import Factory, { Builder } from 'factory.ts';
import { LogMemoryPersistent } from '../LogMemoryPersistent';
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

describe('LogMemoryPersistent', () => {
  describe('crud()', () => {
    it('crud', async () => {
      const mockLogs = [
        persistentLogFactory.build({ startTime: 1 }),
        persistentLogFactory.build({ startTime: 2 }),
      ];
      const logPersistent = new LogMemoryPersistent(Number.MAX_VALUE);
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
  describe('put()', () => {
    it('should limit size', async () => {
      const logPersistent = new LogMemoryPersistent(100);
      expect(await logPersistent.count()).toEqual(0);
      await logPersistent.put(
        persistentLogFactory.build({ size: 10, startTime: 1 }),
      );
      expect(logPersistent['_totalSize']).toEqual(10);
      await logPersistent.put(
        persistentLogFactory.build({ size: 20, startTime: 2 }),
      );
      expect(logPersistent['_totalSize']).toEqual(30);
      await logPersistent.put(
        persistentLogFactory.build({ size: 90, startTime: 3 }),
      );
      expect(logPersistent['_totalSize']).toEqual(90);
    });
  });
  describe('bulkPut()', () => {
    it('should limit size', async () => {
      const logPersistent = new LogMemoryPersistent(100);
      expect(await logPersistent.count()).toEqual(0);
      await logPersistent.put(
        persistentLogFactory.build({ size: 10, startTime: 1 }),
      );
      expect(logPersistent['_totalSize']).toEqual(10);
      await logPersistent.put(
        persistentLogFactory.build({ size: 20, startTime: 2 }),
      );
      expect(logPersistent['_totalSize']).toEqual(30);
      await logPersistent.bulkPut([
        persistentLogFactory.build({ size: 20, startTime: 3 }),
        persistentLogFactory.build({ size: 20, startTime: 4 }),
      ]);
      expect(logPersistent['_totalSize']).toEqual(70);
      await logPersistent.bulkPut([
        persistentLogFactory.build({ size: 20, startTime: 5 }),
        persistentLogFactory.build({ size: 20, startTime: 6 }),
      ]);
      expect(logPersistent['_totalSize']).toEqual(100);
    });
  });
  describe('delete()', () => {
    it('should maintain total size', async () => {
      const logPersistent = new LogMemoryPersistent(100);
      expect(await logPersistent.count()).toEqual(0);
      await logPersistent.put(
        persistentLogFactory.build({ id: 1, size: 10, startTime: 1 }),
      );
      await logPersistent.put(
        persistentLogFactory.build({ id: 2, size: 10, startTime: 2 }),
      );
      await logPersistent.delete(
        persistentLogFactory.build({ id: 1, size: 10, startTime: 1 }),
      );
      expect(logPersistent['_totalSize']).toEqual(10);
      await logPersistent.delete(
        persistentLogFactory.build({ id: 2, size: 10, startTime: 2 }),
      );
      expect(logPersistent['_totalSize']).toEqual(0);
    });
  });
  describe('bulkDelete()', () => {
    it('should maintain total size', async () => {
      const logPersistent = new LogMemoryPersistent(100);
      expect(await logPersistent.count()).toEqual(0);
      await logPersistent.put(
        persistentLogFactory.build({ id: 1, size: 10, startTime: 1 }),
      );
      await logPersistent.put(
        persistentLogFactory.build({ id: 2, size: 10, startTime: 2 }),
      );
      await logPersistent.bulkDelete([
        persistentLogFactory.build({ id: 1, size: 10, startTime: 1 }),
        persistentLogFactory.build({ id: 2, size: 10, startTime: 2 }),
      ]);
      expect(logPersistent['_totalSize']).toEqual(0);
    });
  });
  describe('getAll()', () => {
    it('should return sort array', async () => {
      const logPersistent = new LogMemoryPersistent(100);
      expect(await logPersistent.count()).toEqual(0);
      await logPersistent.put(
        persistentLogFactory.build({ id: 2, size: 10, startTime: 2 }),
      );
      await logPersistent.put(
        persistentLogFactory.build({ id: 3, size: 10, startTime: 3 }),
      );
      await logPersistent.put(
        persistentLogFactory.build({ id: 1, size: 10, startTime: 1 }),
      );
      await logPersistent.put(
        persistentLogFactory.build({ id: 5, size: 10, startTime: 5 }),
      );
      await logPersistent.put(
        persistentLogFactory.build({ id: 4, size: 10, startTime: 4 }),
      );
      const array = await logPersistent.getAll(3);
      expect(
        array.map((item: PersistentLogEntity) => {
          return {
            id: item.id,
            size: item.size,
            startTime: item.startTime,
          };
        }),
      ).toEqual([
        { id: 1, size: 10, startTime: 1 },
        { id: 2, size: 10, startTime: 2 },
        { id: 3, size: 10, startTime: 3 },
      ]);
    });
  });
});
