/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-12 13:52:33
 * Copyright © RingCentral. All rights reserved.
 */

import { SyncUserConfig } from '../SyncUserConfig';
import { AccountGlobalConfig } from '../../../../service/account/config';
import { UserConfigService } from '../../../config/service/UserConfigService';
import { SYNC_CONFIG_KEYS } from '../configKeys';

jest.mock('../../../../module/config/service/UserConfigService');
jest.mock('../../../../service/account/config');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SyncUserConfig', () => {
  let syncUserConfig: SyncUserConfig;
  let userConfigService: UserConfigService;
  function setUp() {
    userConfigService = new UserConfigService();
    userConfigService.setUserId = jest.fn();
    UserConfigService.getInstance = jest
      .fn()
      .mockReturnValue(userConfigService);

    AccountGlobalConfig.getCurrentUserId = jest.fn().mockReturnValue(222);
    syncUserConfig = new SyncUserConfig();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('SOCKET_CONFIG_KEYS.SOCKET_SERVER_HOST', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setSocketServerHost()', () => {
      const data: any = {};
      syncUserConfig.setSocketServerHost([data]);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.SOCKET_SERVER_HOST,
        [data],
      );
    });

    it('getSocketServerHost()', () => {
      const data: any = [{}];
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getSocketServerHost();
      expect(res).toEqual(data);
    });
  });
});
