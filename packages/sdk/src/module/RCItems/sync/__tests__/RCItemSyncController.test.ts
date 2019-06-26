/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 05:42:18
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemSyncController } from '../RCItemSyncController';
import { IdModel } from 'sdk/framework/model';
import { notificationCenter } from 'sdk/service';
import { RCItemUserConfig } from '../../config';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../../config');

class TestSyncController extends RCItemSyncController<IdModel> {
  isTokenInvalidError = jest.fn();
  canUpdateSyncToken = jest.fn();
  requestClearAllAndRemoveLocalData = jest.fn();
  removeLocalData = jest.fn();
  handleDataAndNotify = jest.fn();
  sendSyncRequest = jest.fn();
  doSync = jest.fn();
  handleDataAndSave = jest.fn();
}

describe('RCItemSyncController', () => {
  let userConfig: RCItemUserConfig;
  let syncController: TestSyncController;
  notificationCenter.emitEntityReplace = jest.fn();
  notificationCenter.emitEntityUpdate = jest.fn();
  const mockAccountService = {
    isLoggedIn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    ServiceLoader.getInstance = jest.fn().mockImplementation((data: string) => {
      if (data === ServiceConfig.ACCOUNT_SERVICE) {
        return mockAccountService;
      }
    });
    syncController = new TestSyncController(
      'testName',
      userConfig,
      'eventKey',
      123,
    );
  });

  describe('requestSync', () => {
    it('should do sync when now - last > interval', async () => {
      await syncController.requestSync();
      expect(syncController.doSync).toBeCalledTimes(1);
    });

    it('should not do sync when now - last <= interval', async () => {
      syncController['_lastRequestSyncTime'] = 999999999999999;
      await syncController.requestSync();
      expect(syncController.doSync).toBeCalledTimes(0);
    });
  });

  describe('canDoSilentSync', () => {
    it('should return false when is not login', () => {
      mockAccountService.isLoggedIn.mockReturnValue(false);
      expect(syncController['canDoSilentSync']()).toBeFalsy();
    });
  });
});
