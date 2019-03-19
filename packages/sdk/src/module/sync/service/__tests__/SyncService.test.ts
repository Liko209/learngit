/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

jest.mock('../../../../dao');

import { SyncService } from '../SyncService';

describe('SyncService ', () => {
  let syncService: SyncService = null;
  const syncController = {
    getIndexTimestamp: jest.fn(),
    syncData: jest.fn(),
    handleSocketConnectionStateChanged: jest.fn(),
  };
  beforeEach(() => {
    syncService = new SyncService();
    Object.assign(syncService, {
      _syncController: syncController,
    });
  });

  describe('getIndexTimestamp', () => {
    it('should return correct value', async () => {
      syncController.getIndexTimestamp.mockReturnValue(1);
      expect(syncService.getIndexTimestamp()).toBe(1);
    });
  });

  describe('syncData', () => {
    it('should call syncData of controller', async () => {
      await syncService.syncData();
      expect(syncController.syncData).toBeCalled();
    });
  });

  describe('handleSocketConnectionStateChanged', () => {
    it('should call handleSocketConnectionStateChanged of controller', () => {
      syncService.handleSocketConnectionStateChanged({ state: 'connected' });
      expect(syncController.handleSocketConnectionStateChanged).toBeCalledWith({
        state: 'connected',
      });
    });
  });
});
