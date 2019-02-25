import { daoManager } from '../../../dao';
import handleData from '../handleData';
import { GlobalConfigService } from '../../../module/config';
import { NewGlobalConfig } from '../../../service/config/newGlobalConfig';

import {
  fetchIndexData,
  fetchInitialData,
  fetchRemainingData,
} from '../fetchIndexData';

jest.mock('../../../dao');
jest.mock('../../../dao/config');
jest.mock('../handleData');
jest.mock('../fetchIndexData');
jest.mock('../../../module/config');
GlobalConfigService.getInstance = jest.fn();
jest.mock('../../../service/config/newGlobalConfig');

import SyncService from '..';
import { ApiResultOk } from '../../../api/ApiResult';
describe('SyncService ', () => {
  const syncService = new SyncService();
  const globalConfig = new NewGlobalConfig(null);

  beforeEach(() => {
    NewGlobalConfig.getInstance = jest.fn().mockReturnValue(globalConfig);
  });

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
      fetchIndexData.mockResolvedValueOnce(new ApiResultOk({}, 200, {}));
      globalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(1);
      const spy = jest.spyOn(syncService, '_syncIndexData');
      await syncService.syncData();
      expect(spy).toBeCalled();
    });
  });
});
