import Factory, { Builder } from 'factory.ts';
import { LogPersistence, PersistenceLogEntity } from '../';
// import { PersistenceLogEntity } from '../types';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

const persistenceLogBuilder: Builder<PersistenceLogEntity> = {
  id: Factory.each(i => i),
  sessionId: 'x1',
  startTime: Factory.each(i => Date.now() + i * 600 * 1000),
  endTime: Factory.each(i => Date.now() + i * 1000 * 1000),
  logs: logEntityFactory.buildList(10),
};

export const persistenceLogFactory = Factory.makeFactory(persistenceLogBuilder);

describe('LogPersistence', () => {
  describe('crud()', () => {
    it('crud', async () => {
      const mockLogs = persistenceLogFactory.buildList(2);
      const logPersistence = new LogPersistence();
      expect(await logPersistence.count()).toEqual(0);
      await logPersistence.put(mockLogs[0]);
      await logPersistence.put(mockLogs[1]);
      expect(await logPersistence.count()).toEqual(2);
      const logs = await logPersistence.getAll(10);
      expect(logs).toEqual(mockLogs);
      await logPersistence.delete(mockLogs[0]);
      expect(await logPersistence.count()).toEqual(1);
      await logPersistence.bulkDelete([mockLogs[1]]);
      expect(await logPersistence.count()).toEqual(0);
      await logPersistence.bulkPut(mockLogs);
      expect(await logPersistence.count()).toEqual(2);
      expect(await logPersistence.get(mockLogs[0].id)).toEqual(mockLogs[0]);
      expect(await logPersistence.get(mockLogs[1].id)).toEqual(mockLogs[1]);
    });
  });
  describe('cleanPersistentWhenReachLimit()', () => {
    it('should delete logs to less than half of max size', async () => {
      const mockLogs = [
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }), // maxSize=10, halfMaxSize=5, delete to here
        persistenceLogFactory.build({
          size: 3,
        }),
      ];
      const logPersistence = new LogPersistence();
      logPersistence.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistence.bulkDelete = jest.fn();
      await logPersistence.cleanPersistentWhenReachLimit(10);
      expect(logPersistence.bulkDelete).toBeCalledWith(
        mockLogs.slice(0, 3 + 1),
      );
    });
    it('should delete logs to less than half of max size', async () => {
      const mockLogs = [
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }), // maxSize=10, halfMaxSize=5, delete to here
        persistenceLogFactory.build({
          size: 2,
        }),
        persistenceLogFactory.build({
          size: 3,
        }),
      ];
      const logPersistence = new LogPersistence();
      logPersistence.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistence.bulkDelete = jest.fn();
      await logPersistence.cleanPersistentWhenReachLimit(10);
      expect(logPersistence.bulkDelete).toBeCalledWith(
        mockLogs.slice(0, 2 + 1),
      );
    });
    it('should delete logs to less than half of max size', async () => {
      const mockLogs = [
        persistenceLogFactory.build({
          size: 11,
        }), // maxSize=10, halfMaxSize=5, delete to here
      ];
      const logPersistence = new LogPersistence();
      logPersistence.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistence.bulkDelete = jest.fn();
      await logPersistence.cleanPersistentWhenReachLimit(10);
      expect(logPersistence.bulkDelete).toBeCalledWith(mockLogs);
    });
    it('should now broke when getAll() === null', async () => {
      const logPersistence = new LogPersistence();
      logPersistence.getAll = jest.fn().mockResolvedValue(null);
      logPersistence.bulkDelete = jest.fn();
      await logPersistence.cleanPersistentWhenReachLimit(10);
      expect(logPersistence.cleanPersistentWhenReachLimit).not.toThrow();
      expect(logPersistence.bulkDelete).not.toBeCalled();
    });
    it('should delete all logs when maxPersistenceSize === 0', async () => {
      const mockLogs = [
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }),
        persistenceLogFactory.build({
          size: 3,
        }), // maxSize=0, halfMaxSize=0, delete to here
      ];
      const logPersistence = new LogPersistence();
      logPersistence.getAll = jest.fn().mockResolvedValue(mockLogs);
      logPersistence.bulkDelete = jest.fn();
      await logPersistence.cleanPersistentWhenReachLimit(0);
      expect(logPersistence.bulkDelete).toBeCalledWith(mockLogs);
    });
  });
});
