import { daoManager } from '../../../dao';

import { fetchIndexData } from '../fetchIndexData';

jest.mock('../../../dao');
jest.mock('../../../dao/config');
jest.mock('../handleData');
jest.mock('../fetchIndexData');

import SyncService from '..';
describe('SyncService ', () => {
  const syncService = new SyncService();
  describe('syncData', () => {
    beforeEach(() => {
      daoManager.getKVDao.mockImplementation(() => ({
        get: jest.fn().mockReturnValue(null),
      }));
      jest.clearAllMocks();
    });

    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      daoManager.getKVDao.mockImplementation(() => ({
        get: jest.fn().mockReturnValue(null),
      }));
      jest.spyOn(syncService, '_firstLogin');
      await syncService.syncData();
      expect(syncService._firstLogin).toHaveBeenCalled();
    });
    it('should not call _firstLogin if LAST_INDEX_TIMESTAMP is not null', async () => {
      fetchIndexData.mockResolvedValueOnce({});
      daoManager.getKVDao.mockImplementation(() => ({
        get: jest.fn().mockReturnValue(1),
      }));
      const spy = jest.spyOn(syncService, '_syncIndexData');
      await syncService.syncData();
      expect(spy).toBeCalled();
    });
  });
});
