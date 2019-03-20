/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

import { NewGlobalConfig } from '../../../../service/config/NewGlobalConfig';
import { initialData, remainingData } from '../../../../api';

jest.mock('../../../../service/config/NewGlobalConfig');
jest.mock('../../../../api');
import { SyncController } from '../SyncController';

describe('SyncController ', () => {
  let syncController: SyncController = null;
  beforeEach(() => {
    syncController = new SyncController();
  });

  describe('getIndexTimestamp', () => {
    it('should return correct value when call', async () => {
      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(1);
      expect(syncController.getIndexTimestamp()).toBe(1);
    });
  });

  describe('syncData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(null);
      const spy = jest.spyOn(syncController, '_firstLogin');
      await syncController.syncData();
      expect(spy).toBeCalled();
    });
    it('should call _syncIndexData if LAST_INDEX_TIMESTAMP is not null', async () => {
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(1);
      const spy1 = jest.spyOn(syncController, '_syncIndexData');
      const spy2 = jest.spyOn(syncController, '_fetchRemaining');
      await syncController.syncData();
      expect(spy1).toBeCalled();
      expect(spy2).toBeCalledTimes(1);
    });
    it('should not call _fetchRemaining when sync index data and remaining had ever called', async () => {
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(1);
      NewGlobalConfig.getFetchedRemaining = jest.fn().mockReturnValue(1);
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
      expect(NewGlobalConfig.setLastIndexTimestamp).toBeCalledTimes(1);
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
      expect(NewGlobalConfig.setLastIndexTimestamp).toBeCalledTimes(1);
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
      expect(NewGlobalConfig.setLastIndexTimestamp).toBeCalledTimes(0);
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
      expect(NewGlobalConfig.setLastIndexTimestamp).toHaveBeenCalledTimes(1);
    });
  });
});
