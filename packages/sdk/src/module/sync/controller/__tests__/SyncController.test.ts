/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../dao';
import { NewGlobalConfig } from '../../../../service/config/NewGlobalConfig';

jest.mock('../../../../dao');
jest.mock('../../../../dao/config');
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
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      jest.clearAllMocks();

      Object.assign(syncController, {
        isLoading: false,
      });

      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(null);
      const spy = jest.spyOn(syncController, '_firstLogin');
      await syncController.syncData();
      expect(spy).toBeCalled();
    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      jest.clearAllMocks();
      Object.assign(syncController, {
        isLoading: true,
      });

      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(null);
      const spy = jest.spyOn(syncController, '_firstLogin');
      await syncController.syncData();
      expect(spy).not.toBeCalled();
    });
    it('should not call _firstLogin if LAST_INDEX_TIMESTAMP is not null', async () => {
      jest.clearAllMocks();
      Object.assign(syncController, {
        isLoading: false,
      });

      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      NewGlobalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(1);
      const spy = jest.spyOn(syncController, '_syncIndexData');
      await syncController.syncData();
      expect(spy).toBeCalled();
    });
  });
});
