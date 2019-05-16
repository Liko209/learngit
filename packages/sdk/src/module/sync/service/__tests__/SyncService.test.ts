/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

jest.mock('../../../../dao');

import { SyncService } from '../SyncService';
import { notificationCenter, WINDOW, SERVICE } from '../../../../service';
import { SyncUserConfig } from '../../config/SyncUserConfig';
import { SyncController } from '../../controller/SyncController';

jest.mock('../../config/SyncUserConfig');
jest.mock('../../controller/SyncController');

describe('SyncService ', () => {
  let syncService: SyncService;
  const syncController = {
    getIndexTimestamp: jest.fn(),
    syncData: jest.fn(),
    handleSocketConnectionStateChanged: jest.fn(),
    handleStoppingSocketEvent: jest.fn(),
    handleWakeUpFromSleep: jest.fn(),
    handleWindowFocused: jest.fn(),
    updateIndexTimestamp: jest.fn(),
  };
  beforeEach(() => {
    syncService = new SyncService();
    Object.assign(syncService, {
      _syncController: syncController,
    });
  });

  describe('userConfig', () => {
    it('should create userConfig', () => {
      syncService.userConfig;
      expect(SyncUserConfig).toBeCalled();
    });
  });

  describe('getSyncController', () => {
    it('should create getSyncController', () => {
      syncService['_syncController'] = undefined as any;
      syncService['getSyncController']();
      expect(SyncController).toBeCalled();
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
  describe('notification events', () => {
    it('SERVICE.STOPPING_SOCKET', () => {
      syncService.start();
      notificationCenter.emitKVChange(SERVICE.STOPPING_SOCKET);
      expect(syncController.handleStoppingSocketEvent).toHaveBeenCalledTimes(1);
    });
    it('SERVICE.WAKE_UP_FROM_SLEEP', () => {
      notificationCenter.emitKVChange(SERVICE.WAKE_UP_FROM_SLEEP);
      expect(syncController.handleWakeUpFromSleep).toHaveBeenCalledTimes(1);
    });
    it('WINDOW.FOCUS', () => {
      notificationCenter.emitKVChange(WINDOW.FOCUS);
      expect(syncController.handleWindowFocused).toHaveBeenCalledTimes(1);
    });
    // it('SOCKET.TIMESTAMP', async (done: any) => {
    //   await dataDispatcher.onDataArrived(
    //     JSON.stringify({ body: { timestamp: 10, objects: [] } }),
    //   );
    //   expect(syncController.updateIndexTimestamp).toHaveBeenCalledTimes(1);
    // });
  });
});
