/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

import { NewGlobalConfig } from '../../../../service/config/NewGlobalConfig';
import { initialData, remainingData } from '../../../../api';
import { SyncUserConfig } from '../../config/SyncUserConfig';
import { GlobalConfigService } from '../../../config';
import { SyncController } from '../SyncController';
import { AccountGlobalConfig } from '../../../../service/account/config';

jest.mock('../../config/SyncUserConfig');
jest.mock('../../../../service/config/NewGlobalConfig');
jest.mock('../../../../api');
jest.mock('../../../config');

describe('SyncController ', () => {
  let syncController: SyncController = null;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    syncController = new SyncController();
    GlobalConfigService.getInstance = jest.fn().mockReturnValue({
      get: jest.fn(),
      put: jest.fn(),
    });
  });

  describe('getIndexTimestamp', () => {
    it('should return correct value when call', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      expect(syncController.getIndexTimestamp()).toBe(1);
    });
  });

  describe('syncData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(null);
      const spy = jest.spyOn(syncController, '_firstLogin');
      await syncController.syncData();
      expect(spy).toBeCalled();
    });
    it('should call _syncIndexData if LAST_INDEX_TIMESTAMP is not null', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      const spy1 = jest.spyOn(syncController, '_syncIndexData');
      const spy2 = jest.spyOn(syncController, '_fetchRemaining');
      await syncController.syncData();
      expect(spy1).toBeCalled();
      expect(spy2).toBeCalledTimes(1);
    });
    it('should not call _fetchRemaining when sync index data and remaining had ever called', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      SyncUserConfig.prototype.getFetchedRemaining = jest
        .fn()
        .mockReturnValue(1);
      const spy2 = jest.spyOn(syncController, '_fetchRemaining');
      await syncController.syncData();
      expect(spy2).toBeCalledTimes(0);
    });
  });
  describe('updateIndexTimestamp', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
    });
    it('should call updateCanUpdateIndexTimeStamp when forceUpdate is true', () => {
      jest
        .spyOn(syncController, 'updateCanUpdateIndexTimeStamp')
        .mockImplementationOnce(() => {});

      syncController.updateIndexTimestamp(1, true);
      expect(syncController.updateCanUpdateIndexTimeStamp).toBeCalledTimes(1);
      expect(SyncUserConfig.prototype.setLastIndexTimestamp).toBeCalledTimes(1);
    });

    it('should not call updateCanUpdateIndexTimeStamp when forceUpdate is false', () => {
      jest
        .spyOn(syncController, 'updateCanUpdateIndexTimeStamp')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(syncController, 'canUpdateIndexTimeStamp')
        .mockReturnValueOnce(true);
      syncController.updateIndexTimestamp(1, false);
      expect(syncController.updateCanUpdateIndexTimeStamp).toBeCalledTimes(0);
      expect(SyncUserConfig.prototype.setLastIndexTimestamp).toBeCalledTimes(1);
    });

    it('should not call NewGlobalConfig.setLastIndexTimestamp when it is not forceUpdate and can not update time stamp', () => {
      jest
        .spyOn(syncController, 'updateCanUpdateIndexTimeStamp')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(syncController, 'canUpdateIndexTimeStamp')
        .mockReturnValueOnce(false);
      syncController.updateIndexTimestamp(1, false);
      expect(syncController.updateCanUpdateIndexTimeStamp).toBeCalledTimes(0);
      expect(SyncUserConfig.prototype.setLastIndexTimestamp).toBeCalledTimes(0);
    });
  });
  describe('_handleIncomingData', () => {
    it('should call setLastIndexTimestamp and setSocketServerHost only once when first login', async () => {
      NewGlobalConfig.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(undefined);
      initialData.mockResolvedValueOnce({
        timestamp: 11,
        scoreboard: 'aws11',
      });
      remainingData.mockResolvedValueOnce({
        timestamp: 222,
        scoreboard: 'aws22',
      });
      jest
        .spyOn(syncController, '_dispatchIncomingData')
        .mockImplementationOnce(() => {});
      await syncController.syncData();
      expect(
        SyncUserConfig.prototype.setLastIndexTimestamp,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
