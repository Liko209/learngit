import { daoManager } from '../../../dao';
import handleData from '../handleData';

import {
  fetchIndexData,
  fetchInitialData,
  fetchRemainingData,
} from '../fetchIndexData';
import { GlobalConfigService } from '../../../module/config';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';

jest.mock('../../../dao');
jest.mock('../../../dao/config');
jest.mock('../handleData');
jest.mock('../fetchIndexData');
jest.mock('../../../module/config');
GlobalConfigService.getInstance = jest.fn();

import SyncService from '..';
describe('SyncService ', () => {
  const syncService = new SyncService();
  describe('syncData', () => {
    beforeAll(() => {

    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      jest.clearAllMocks();

      Object.assign(syncService, {
        isLoading: false,
      });

      const spy = jest.spyOn(syncService, '_firstLogin');
      await syncService.syncData();
      expect(spy).toBeCalled();
    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      jest.clearAllMocks();
      Object.assign(syncService, {
        isLoading: true,
      });

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

      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(1);
      const spy = jest.spyOn(syncService, '_syncIndexData');
      await syncService.syncData();
      expect(spy).toBeCalled();
    });
  });
});
