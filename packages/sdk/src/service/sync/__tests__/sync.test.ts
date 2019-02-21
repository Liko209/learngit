import { daoManager } from '../../../dao';
import ConfigDao from '../../../dao/config';
import handleData from '../handleData';

import {
  fetchIndexData,
  fetchInitialData,
  fetchRemainingData,
} from '../fetchIndexData';

jest.mock('../../../dao');
jest.mock('../../../dao/config');
jest.mock('../handleData');
jest.mock('../fetchIndexData');

import SyncService from '..';
describe('SyncService ', () => {
  const syncService = new SyncService();
  describe('syncData', () => {
    beforeAll(() => {
      daoManager.getKVDao.mockImplementation(() => ({
        get: jest.fn().mockReturnValue(null),
      }));
    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      jest.clearAllMocks();

      Object.assign(syncService, {
        isLoading: false,
      });

      daoManager.getKVDao.mockImplementation(() => ({
        get: jest.fn().mockReturnValue(null),
      }));
      const spy = jest.spyOn(syncService, '_firstLogin');
      await syncService.syncData();
      expect(spy).toBeCalled();
    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      jest.clearAllMocks();
      Object.assign(syncService, {
        isLoading: true,
      });

      daoManager.getKVDao.mockImplementation(() => ({
        get: jest.fn().mockReturnValue(null),
      }));
      const spy = jest.spyOn(syncService, '_firstLogin');
      await syncService.syncData();
      expect(spy).not.toBeCalled();
    });
    it('should not call _firstLogin if LAST_INDEX_TIMESTAMP is not null', async () => {
      jest.clearAllMocks();
      Object.assign(syncService, {
        isLoading: false,
      });
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
