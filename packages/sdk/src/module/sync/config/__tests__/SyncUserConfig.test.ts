/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-12 13:52:33
 * Copyright © RingCentral. All rights reserved.
 */

import { SyncUserConfig } from '../SyncUserConfig';
import { UserConfigService } from '../../../config/service/UserConfigService';
import { SYNC_CONFIG_KEYS } from '../configKeys';
import { ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../../module/config/service/UserConfigService');
jest.mock('../../../../module/account/config');

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
    ServiceLoader.getInstance = jest.fn().mockReturnValue(userConfigService);

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

  describe('SYNC_CONFIG_KEYS.INDEX_START_LOCAL_TIME', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setIndexStartLocalTime()', () => {
      const data: number = 1;
      syncUserConfig.setIndexStartLocalTime(data);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.INDEX_START_LOCAL_TIME,
        data,
      );
    });

    it('getIndexStartLocalTime()', () => {
      const data: number = 1;
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getIndexStartLocalTime();
      expect(res).toEqual(data);
    });
  });
  describe('SYNC_CONFIG_KEYS.SOCKET_CONNECTED_LOCAL_TIME', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setSocketConnectedLocalTime()', () => {
      const data: number = 1;
      syncUserConfig.setSocketConnectedLocalTime(data);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.SOCKET_CONNECTED_LOCAL_TIME,
        data,
      );
    });

    it('getSocketConnectedLocalTime()', () => {
      const data: number = 1;
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getSocketConnectedLocalTime();
      expect(res).toEqual(data);
    });
  });
});
