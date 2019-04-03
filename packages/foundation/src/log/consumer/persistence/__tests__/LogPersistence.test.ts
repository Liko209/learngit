import { LogPersistence } from '../LogPersistence';
describe('LogPersistence', () => {
  describe('crud()', () => {
    const mockLogs = [
      {
        id: 111,
        sessionId: 'joy',
        startTime: Date.now(),
        endTime: Date.now(),
        logs: [],
      },
      {
        id: 112,
        sessionId: 'marry',
        startTime: Date.now(),
        endTime: Date.now(),
        logs: [],
      },
    ];
    it('crud', async () => {
      const logPersistence = new LogPersistence();
      await logPersistence.init();
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
});
