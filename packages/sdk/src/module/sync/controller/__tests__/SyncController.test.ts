/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

import { NewGlobalConfig } from '../../../../service/config/NewGlobalConfig';

jest.mock('../../../../service/config/NewGlobalConfig');

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
});
