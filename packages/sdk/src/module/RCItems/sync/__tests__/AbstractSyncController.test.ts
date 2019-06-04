/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 05:13:46
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractSyncController } from '../AbstractSyncController';
import { SYNC_TYPE } from '../constants';
import { silentSyncProcessorHandler } from '../SilentSyncProcessorHandler';
import { IdModel } from 'sdk/framework/model';
import { SYNC_DIRECTION } from '../../constants';
import { RCItemUserConfig } from '../../config';
import { ERROR_CODES_SDK } from 'sdk/error';

jest.mock('../../config');

class TestSyncController extends AbstractSyncController<IdModel> {
  setSyncToken = jest.fn();
  getSyncToken = jest.fn();
  removeSyncToken = jest.fn();
  setHasMore = jest.fn();
  removeHasMore = jest.fn();
  hasPermission = jest.fn();
  canDoSilentSync = jest.fn();
  isTokenInvalidError = jest.fn();
  canUpdateSyncToken = jest.fn();
  requestClearAllAndRemoveLocalData = jest.fn();
  handleDataAndSave = jest.fn();
  sendSyncRequest = jest.fn();
}

describe('AbstractSyncController', () => {
  let syncController: TestSyncController;
  let userConfig: RCItemUserConfig;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    userConfig = new RCItemUserConfig('a');
    syncController = new TestSyncController('test', userConfig, 'entity', 123);
    silentSyncProcessorHandler.addProcessor = jest.fn();
  });

  describe('doSync', () => {
    it('should do nothing when does not have permission', async () => {
      syncController.hasPermission.mockReturnValueOnce(false);

      await syncController.doSync(false, SYNC_DIRECTION.NEWER);
      expect(syncController.hasPermission).toBeCalledTimes(1);
      expect(syncController.getSyncToken).toBeCalledTimes(0);
    });

    it('should do nothing when is in clear', async () => {
      syncController.hasPermission.mockReturnValueOnce(true);
      syncController['_syncStatus'] = 2;

      await syncController.doSync(false, SYNC_DIRECTION.NEWER);
      expect(syncController.hasPermission).toBeCalledTimes(1);
      expect(syncController.getSyncToken).toBeCalledTimes(0);
    });

    it('should do FSync when does not have token', async () => {
      syncController.hasPermission.mockReturnValueOnce(true);
      syncController.getSyncToken.mockReturnValueOnce(undefined);
      const mockData = { id: 123 };
      syncController['_doFSync'] = jest.fn().mockReturnValueOnce([mockData]);

      expect(
        await syncController.doSync(true, SYNC_DIRECTION.NEWER, 12),
      ).toEqual([mockData]);
      expect(syncController.hasPermission).toBeCalledTimes(1);
      expect(syncController.getSyncToken).toBeCalledTimes(1);
      expect(syncController['_doFSync']).toBeCalledWith(true, 12);
    });

    it('should do ISync immediately when isSilent is false', async () => {
      syncController.hasPermission.mockReturnValueOnce(true);
      syncController.getSyncToken.mockReturnValueOnce('token');
      syncController['_doFSync'] = jest.fn();
      const mockData = { id: 123 };
      syncController['_startSync'] = jest
        .fn()
        .mockResolvedValueOnce([mockData]);

      expect(
        await syncController.doSync(false, SYNC_DIRECTION.NEWER, 12),
      ).toEqual([mockData]);
      expect(syncController.hasPermission).toBeCalledTimes(1);
      expect(syncController.getSyncToken).toBeCalledTimes(1);
      expect(syncController['_doFSync']).toBeCalledTimes(0);
      expect(syncController['_startSync']).toBeCalledWith(
        false,
        SYNC_TYPE.ISYNC,
        SYNC_DIRECTION.NEWER,
        12,
      );
      expect(syncController['_lastSyncNewerTime']).toBeGreaterThan(0);
    });

    it('should add processor when isSilent is true and can do silent sync', async () => {
      syncController.hasPermission.mockReturnValueOnce(true);
      syncController.getSyncToken.mockReturnValueOnce('token');
      syncController.canDoSilentSync.mockReturnValueOnce(true);
      syncController['_doFSync'] = jest.fn();
      syncController['_startSync'] = jest.fn();

      expect(
        await syncController.doSync(true, SYNC_DIRECTION.NEWER, 12),
      ).toEqual([]);
      expect(syncController.hasPermission).toBeCalledTimes(1);
      expect(syncController.getSyncToken).toBeCalledTimes(1);
      expect(syncController['_doFSync']).toBeCalledTimes(0);
      expect(syncController['_startSync']).toBeCalledTimes(0);
      expect(syncController.canDoSilentSync).toBeCalledTimes(1);
      expect(syncController['_lastSyncNewerTime']).toBeGreaterThan(0);
      expect(silentSyncProcessorHandler.addProcessor).toBeCalledTimes(1);
    });
  });

  describe('_doFSync', () => {
    it('should throw error when is already in FSync', async () => {
      syncController['_syncStatus'] = 1;
      syncController['_startSync'] = jest.fn();
      try {
        await syncController['_doFSync'](true);
      } catch (err) {
        expect(err.code).toEqual(ERROR_CODES_SDK.INVALID_SYNC_TOKEN);
      }
      expect(silentSyncProcessorHandler.addProcessor).toBeCalledTimes(0);
      expect(syncController['_startSync']).toBeCalledTimes(0);
    });

    it('should add processor when isSilent is true', async () => {
      syncController['_startSync'] = jest.fn();

      await syncController['_doFSync'](true, 13);
      expect(silentSyncProcessorHandler.addProcessor).toBeCalledTimes(1);
      expect(syncController['_startSync']).toBeCalledTimes(0);
    });

    it('should do FSync immediately when isSilent is false', async () => {
      syncController['_startSync'] = jest.fn().mockResolvedValueOnce('result');

      await syncController['_doFSync'](false, 13);
      expect(silentSyncProcessorHandler.addProcessor).toBeCalledTimes(0);
      expect(syncController['_startSync']).toBeCalledWith(
        false,
        SYNC_TYPE.FSYNC,
        undefined,
        13,
      );
    });
  });

  describe('clearAll', () => {
    it('should call requestClearAllAndRemoveLocalData', async () => {
      syncController.requestClearAllAndRemoveLocalData.mockResolvedValueOnce(
        'result',
      );

      await syncController.clearAll();
      expect(syncController.requestClearAllAndRemoveLocalData).toBeCalledTimes(
        1,
      );
      expect(syncController['_syncStatus']).toEqual(0);
    });
  });
});
