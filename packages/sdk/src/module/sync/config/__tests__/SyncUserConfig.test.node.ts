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

  describe('SOCKET_CONFIG_KEYS.INDEX_SOCKET_SERVER_HOST', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setIndexSocketServerHost()', () => {
      const data: string = 'mockHost';
      syncUserConfig.setIndexSocketServerHost(data);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.INDEX_SOCKET_SERVER_HOST,
        data,
      );
    });

    it('getIndexSocketServerHost()', () => {
      const data: string = 'mockHost';
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getIndexSocketServerHost();
      expect(userConfigService.get).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.INDEX_SOCKET_SERVER_HOST,
      );
      expect(res).toEqual(data);
    });

    it('removeIndexSocketServerHost()', () => {
      userConfigService.remove = jest.fn();
      syncUserConfig.removeIndexSocketServerHost();
      expect(userConfigService.remove).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.INDEX_SOCKET_SERVER_HOST,
      );
    });
  });

  describe('SOCKET_CONFIG_KEYS.RECONNECT_SOCKET_SERVER_HOST', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setReconnectSocketServerHost()', () => {
      const data: string = 'mockHost';
      syncUserConfig.setReconnectSocketServerHost(data);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.RECONNECT_SOCKET_SERVER_HOST,
        data,
      );
    });

    it('getReconnectSocketServerHost()', () => {
      const data: string = 'mockHost';
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getReconnectSocketServerHost();
      expect(userConfigService.get).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.RECONNECT_SOCKET_SERVER_HOST,
      );
      expect(res).toEqual(data);
    });

    it('removeReconnectSocketServerHost()', () => {
      userConfigService.remove = jest.fn();
      syncUserConfig.removeReconnectSocketServerHost();
      expect(userConfigService.remove).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.RECONNECT_SOCKET_SERVER_HOST,
      );
    });
  });

  describe('SOCKET_CONFIG_KEYS.FETCHED_REMAINING', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setFetchedRemaining()', () => {
      const data = true;
      syncUserConfig.setFetchedRemaining(data);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.FETCHED_REMAINING,
        data,
      );
    });

    it('getFetchedRemaining()', () => {
      const data = true;
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getFetchedRemaining();
      expect(userConfigService.get).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.FETCHED_REMAINING,
      );
      expect(res).toEqual(data);
    });

    it('removeFetchRemaining()', () => {
      userConfigService.remove = jest.fn();
      syncUserConfig.removeFetchRemaining();
      expect(userConfigService.remove).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.FETCHED_REMAINING,
      );
    });
  });

  describe('SOCKET_CONFIG_KEYS.INDEX_SUCCEED', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('updateIndexSucceed()', () => {
      const data = true;
      syncUserConfig.updateIndexSucceed(data);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.INDEX_SUCCEED,
        data,
      );
    });

    it('getIndexSucceed()', () => {
      const data = true;
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getIndexSucceed();
      expect(userConfigService.get).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.INDEX_SUCCEED,
      );
      expect(res).toEqual(data);
    });

    it('removeIndexSucceed()', () => {
      userConfigService.remove = jest.fn();
      syncUserConfig.removeIndexSucceed();
      expect(userConfigService.remove).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.INDEX_SUCCEED,
      );
    });
  });

  describe('SOCKET_CONFIG_KEYS.LAST_INDEX_TIMESTAMP', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setLastIndexTimestamp()', () => {
      const data: string = '1234';
      syncUserConfig.setLastIndexTimestamp(data);
      expect(userConfigService.put).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP,
        data,
      );
    });

    it('getLastIndexTimestamp()', () => {
      const data: string = '1234';
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = syncUserConfig.getLastIndexTimestamp();
      expect(userConfigService.get).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP,
      );
      expect(res).toEqual(data);
    });

    it('removeLastIndexTimestamp()', () => {
      userConfigService.remove = jest.fn();
      syncUserConfig.removeLastIndexTimestamp();
      expect(userConfigService.remove).toBeCalledWith(
        'sync',
        SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP,
      );
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

    it('removeIndexStartLocalTime()', () => {
      userConfigService.remove = jest.fn();
      syncUserConfig.removeIndexStartLocalTime();
      expect(userConfigService.remove).toBeCalled();
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

    it('removeSocketConnectedLocalTime()', () => {
      userConfigService.remove = jest.fn();
      syncUserConfig.removeSocketConnectedLocalTime();
      expect(userConfigService.remove).toBeCalled();
    });
  });

  describe('clearSyncConfigsForDBUpgrade', () => {
    it('', () => {
      syncUserConfig.removeIndexSocketServerHost = jest.fn();
      syncUserConfig.removeReconnectSocketServerHost = jest.fn();
      syncUserConfig.removeLastIndexTimestamp = jest.fn();
      syncUserConfig.removeFetchRemaining = jest.fn();
      syncUserConfig.removeIndexSucceed = jest.fn();
      syncUserConfig.removeIndexStartLocalTime = jest.fn();
      syncUserConfig.removeSocketConnectedLocalTime = jest.fn();

      syncUserConfig.clearSyncConfigsForDBUpgrade();

      expect(syncUserConfig.removeIndexSocketServerHost).toBeCalled();
      expect(syncUserConfig.removeReconnectSocketServerHost).toBeCalled();
      expect(syncUserConfig.removeLastIndexTimestamp).toBeCalled();
      expect(syncUserConfig.removeFetchRemaining).toBeCalled();
      expect(syncUserConfig.removeIndexSucceed).toBeCalled();
      expect(syncUserConfig.removeIndexStartLocalTime).toBeCalled();
      expect(syncUserConfig.removeSocketConnectedLocalTime).toBeCalled();
    });
  });
});
