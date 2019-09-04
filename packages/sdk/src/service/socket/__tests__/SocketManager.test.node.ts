/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */
// / <reference path="../../../__tests__/types.d.ts" />
import { SocketManager } from '../SocketManager';
import { SocketFSM } from '../SocketFSM';
import notificationCenter from '../../notificationCenter';
import { SERVICE, CONFIG, SOCKET } from '../../eventKey';
import SocketIO from '../__mocks__/socket';
import { SocketClient } from 'foundation/network';
import { powerMonitor } from 'foundation/utils';
import { SocketCanConnectController } from '../SocketCanConnectController';
import { getCurrentTime } from '../../../utils/jsUtils';
import { SyncUserConfig } from '../../../module/sync/config/SyncUserConfig';
import { ServiceLoader, ServiceConfig } from '../../../module/serviceLoader';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';

jest.mock('../../../module/config');
jest.mock('../SocketCanConnectController');
jest.mock('../../../utils/jsUtils');
jest.mock('foundation/network/client/socket');
jest.mock('../../../dao');
const mockedSetReconnection = jest.fn((bOn: boolean) => {});
SocketFSM.prototype = {
  ...SocketFSM.prototype,
  setReconnection: mockedSetReconnection,
  doGlipPing: jest.fn().mockImplementation(() => {}),
};

jest.mock('../../../module/sync/config/SyncUserConfig', () => {
  const config = {
    getSocketServerHost: jest.fn(),
    setSocketServerHost: jest.fn(),
    getLastIndexTimestamp: jest.fn(),
    getLastCanReconnectTime: jest.fn().mockReturnValueOnce(0),
    setLastCanReconnectTime: jest.fn(),
  };
  return {
    SyncUserConfig: () => config,
  };
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('Socket Manager', () => {
  let syncUserConfig: SyncUserConfig;
  const socketManager = SocketManager.getInstance();
  Object.assign(socketManager, { _currentId: 1 });
  const test_url = 'test_url';
  const mock = {
    type: '',
    payload: test_url,
  };

  beforeAll(() => {
    SocketClient.prototype.socket = new SocketIO();
  });

  function mockCanReconnectController() {
    jest
      .spyOn(SocketCanConnectController.prototype, 'doCanConnectApi')
      .mockImplementation(async ({ callback, forceOnline, nthCount }) => {
        callback(1);
      });

    jest
      .spyOn(SocketCanConnectController.prototype, 'isDoingCanConnect')
      .mockReturnValue(false);
  }

  function setUp() {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { authUserConfig: AuthUserConfig.prototype };
        }
        if (config === ServiceConfig.SYNC_SERVICE) {
          return { userConfig: syncUserConfig };
        }
      });
    getCurrentTime.mockReturnValue(1);
    syncUserConfig = new SyncUserConfig();
    mockedSetReconnection.mockRestore();
    syncUserConfig.getIndexSocketServerHost = jest
      .fn()
      .mockReturnValue(test_url);
    syncUserConfig.getReconnectSocketServerHost = jest.fn().mockReturnValue('');
    mock.payload = test_url;
    notificationCenter.emitKVChange(SERVICE.LOGOUT);
    mockCanReconnectController();
  }

  describe('check canReconnectController', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('should be null when socketManager init', () => {
      expect(socketManager['_canReconnectController']).toBeUndefined();
    });

    it('should not be null when has active FSM', () => {
      syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValueOnce(1);
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager['_canReconnectController']).not.toBeUndefined();
      expect(socketManager.hasActiveFSM()).toBeTruthy();

      notificationCenter.emitKVChange(SERVICE.LOGOUT);
      expect(socketManager['_canReconnectController']).toBeUndefined();
    });
    it('should not have active FSM if id is incorrect', () => {
      syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
      getCurrentTime.mockReturnValue(2);
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    it('should not try to restart a new one if is doing can reconnect request', () => {
      jest
        .spyOn<any, any>(socketManager, '_startRealFSM')
        .mockImplementation(() => {});
      syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(1);

      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager['_startRealFSM']).toHaveBeenCalledTimes(1);

      jest
        .spyOn(SocketCanConnectController.prototype, 'isDoingCanConnect')
        .mockReturnValue(true);

      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager['_startRealFSM']).toHaveBeenCalledTimes(1);
    });
  });

  describe('logger: function is normal operation', () => {
    socketManager.warn('test logger.warn');
    socketManager.error('test logger.error');
    socketManager.info('test logger.info');
  });

  describe('Event', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('singleton', () => {
      const manager = SocketManager.getInstance();
      expect(manager.hasActiveFSM()).toEqual(socketManager.hasActiveFSM());
      expect(manager.ongoingFSMCount()).toEqual(
        socketManager.ongoingFSMCount(),
      );
    });

    it('login without timestamp', () => {
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      syncUserConfig.getLastIndexTimestamp.mockReturnValue(null);
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      expect(socketManager.ongoingFSMCount()).toEqual(0);
    });

    it('initial done event', () => {
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      syncUserConfig.getLastIndexTimestamp.mockReturnValue(null);
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      expect(socketManager.ongoingFSMCount()).toEqual(0);
    });

    it('initial done event', () => {
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      expect(socketManager.ongoingFSMCount()).toEqual(1);
    });

    it('logout', () => {
      notificationCenter.emitKVChange(SERVICE.LOGOUT);
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    describe('network_change', () => {
      beforeEach(() => {
        clearMocks();
        setUp();
      });
      it('online before logged in', () => {
        notificationCenter.emitKVChange(SERVICE.LOGOUT);
        expect(socketManager.hasActiveFSM()).toBeFalsy();
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'online',
        });
        expect(socketManager.hasActiveFSM()).toBeFalsy();
        expect(socketManager.isConnected()).toBeFalsy();
      });

      it('online after logged in', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmNameBeforeOnline = socketManager.activeFSM.name;
        expect(!!fsmNameBeforeOnline).toBeTruthy();
        socketManager.activeFSM.finishConnect();
        expect(socketManager.isConnected()).toBeTruthy();
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'online',
        });
        const fsmNameAfterOnline = socketManager.activeFSM.name;
        expect(!!fsmNameAfterOnline).toBeTruthy();
        expect(fsmNameBeforeOnline).not.toEqual(fsmNameAfterOnline);
      });

      it('offline', () => {
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'offline',
        });
        expect(socketManager.hasActiveFSM()).toBeFalsy();
      });

      it('focus', () => {
        // 1. user is not login do nothing
        notificationCenter.emitKVChange(SERVICE.LOGOUT);
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'focus',
        });
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        // 2. user login should start FSM and should not do ping pong
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(socketManager.activeFSM.doGlipPing).toHaveBeenCalledTimes(0);

        // 3. emit focus event and has activated FSM should to ping pong
        socketManager.activeFSM.finishConnect();
        expect(socketManager.isConnected()).toBeTruthy();
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'focus',
        });
        expect(socketManager.activeFSM.doGlipPing).toHaveBeenCalledTimes(1);

        socketManager.activeFSM.fireDisconnect();
        expect(socketManager.isConnected()).toBeFalsy();

        // 4. has not activated FSM, emit focus event, should try to restart FSM
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        socketManager._stopActiveFSM();
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'focus',
        });
        expect(socketManager.hasActiveFSM()).toBeTruthy();

        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'refresh',
        });

        // 5. user is not login,
        notificationCenter.emitKVChange(SERVICE.LOGOUT);
        expect(socketManager.hasActiveFSM()).toBeFalsy();
        expect(socketManager.isConnected()).toBeFalsy();
      });
    });

    describe('server_host_updated', () => {
      it('should do nothing when user has not login', () => {
        notificationCenter.emitKVChange(CONFIG.INDEX_SOCKET_SERVER_HOST, 'url');
        expect(socketManager.hasActiveFSM()).toBeFalsy();
        notificationCenter.emitKVChange(
          CONFIG.INDEX_SOCKET_SERVER_HOST,
          'new_url_server_host_updated',
        );
        expect(socketManager.hasActiveFSM()).toBeFalsy();
      });
      it('incomes new index socket host', () => {
        syncUserConfig = new SyncUserConfig();
        syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValue('1');
        syncUserConfig.getIndexSocketServerHost = jest
          .fn()
          .mockReturnValueOnce('');
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        const url = 'incomes_new_index_socket_url';

        notificationCenter.emitKVChange(CONFIG.INDEX_SOCKET_SERVER_HOST, url);
        // 1. use has not not login do nothing
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
        // 2. should not start FSM since there is not socket host
        expect(socketManager['_hasLoggedIn']).toBeTruthy();
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        notificationCenter.emitKVChange(CONFIG.INDEX_SOCKET_SERVER_HOST, '');
        // 3. do nothing for invalid url
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        syncUserConfig.getIndexSocketServerHost = jest
          .fn()
          .mockReturnValue(url);
        notificationCenter.emitKVChange(CONFIG.INDEX_SOCKET_SERVER_HOST, url);
        expect(socketManager.hasActiveFSM()).toBeTruthy();

        // 4. should not start a new one when socket is connected
        const fsm1 = socketManager.activeFSM.name;
        socketManager.activeFSM.finishConnect();
        notificationCenter.emitKVChange(
          CONFIG.INDEX_SOCKET_SERVER_HOST,
          'new_one1',
        );
        const fsm2 = socketManager.activeFSM.name;
        expect(fsm1).toEqual(fsm2);

        // 5. should start a new one when socket is not connected
        socketManager.activeFSM.fireDisconnect();
        notificationCenter.emitKVChange(
          CONFIG.INDEX_SOCKET_SERVER_HOST,
          'new_one2',
        );
        const fsm3 = socketManager.activeFSM.name;
        expect(fsm1).not.toEqual(fsm3);
      });

      it('incomes new reconnect socket address', () => {
        syncUserConfig = new SyncUserConfig();
        syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValue('');
        syncUserConfig.getIndexSocketServerHost = jest.fn().mockReturnValue('');
        syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValue('1');
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
        expect(socketManager._hasLoggedIn).toBeTruthy();

        // 1. should do nothing when new url is invalid
        notificationCenter.emitKVChange(SOCKET.RECONNECT, { body: '' });
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        notificationCenter.emitKVChange(SOCKET.RECONNECT, {
          body: 'server:""',
        });
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        syncUserConfig.setReconnectSocketServerHost = jest
          .fn()
          .mockImplementation(() => {});

        // 2. should start a new one
        let url = 'reconnect_url_1';
        syncUserConfig.getIndexSocketServerHost = jest
          .fn()
          .mockReturnValue(url);
        notificationCenter.emitKVChange(SOCKET.RECONNECT, {
          body: JSON.stringify({ server: url }),
        });
        expect(socketManager.hasActiveFSM()).toBeTruthy();

        socketManager.activeFSM.finishConnect();
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsm1 = socketManager.activeFSM.name;

        // 3. should not start a new one if the old url is the same to new
        notificationCenter.emitKVChange(SOCKET.RECONNECT, {
          body: JSON.stringify({ server: url }),
        });
        const fsm2 = socketManager.activeFSM.name;
        expect(fsm1).toEqual(fsm2);

        // 4. should start a new one if url are not the same
        url = 'reconnect_url_2';
        notificationCenter.emitKVChange(SOCKET.RECONNECT, {
          body: JSON.stringify({ server: url }),
        });
        const fsm3 = socketManager.activeFSM.name;
        expect(fsm1).not.toEqual(fsm3);
      });

      it('should clear reconnect socket address if use it connect fail', () => {
        syncUserConfig = new SyncUserConfig();
        syncUserConfig.setReconnectSocketServerHost = jest.fn();
        syncUserConfig.getReconnectSocketServerHost = jest
          .fn()
          .mockReturnValue('reconnect_socket');
        syncUserConfig.getIndexSocketServerHost = jest
          .fn()
          .mockReturnValue('index_socket');

        syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValue('1');

        // 1. use reconnect-socket-address first
        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(socketManager.isConnected()).toBeFalsy();
        expect(socketManager.activeFSM.serverUrl).toEqual('reconnect_socket');

        socketManager.activeFSM.finishConnect();

        // 2. should clear reconnect-socket-address if connect failed
        socketManager.activeFSM.fireDisconnect();
        expect(
          syncUserConfig.setReconnectSocketServerHost,
        ).toHaveBeenCalledWith('');
      });
      it('should not clear reconnect socket address if does not use it to connect', () => {
        syncUserConfig = new SyncUserConfig();
        syncUserConfig.setReconnectSocketServerHost = jest.fn();
        syncUserConfig.getReconnectSocketServerHost = jest
          .fn()
          .mockReturnValue('');
        syncUserConfig.getIndexSocketServerHost = jest
          .fn()
          .mockReturnValue('index_socket');

        syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValue('1');

        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });

        socketManager.activeFSM.finishConnect();
        socketManager.activeFSM.fireDisconnect();
        expect(
          syncUserConfig.setReconnectSocketServerHost,
        ).toHaveBeenCalledTimes(0);

        // does not have reconnect-socket-host, use index-socket-host
        expect(socketManager.activeFSM.serverUrl).toEqual('index_socket');
      });

      it('should clear socket address when socket error happened', () => {
        syncUserConfig = new SyncUserConfig();
        syncUserConfig.setIndexSocketServerHost = jest.fn();
        syncUserConfig.setReconnectSocketServerHost = jest.fn();
        socketManager['_reconnectRetryCount'] = 10;
        notificationCenter.emitKVChange(SOCKET.ERROR);
        expect(socketManager['_reconnectRetryCount']).toEqual(11);
      });

      it('should clear socket address when socket connect error happened', () => {
        syncUserConfig = new SyncUserConfig();
        syncUserConfig.setIndexSocketServerHost = jest.fn();
        syncUserConfig.setReconnectSocketServerHost = jest.fn();
        socketManager['_reconnectRetryCount'] = 0;
        notificationCenter.emitKVChange(SOCKET.CONNECT_ERROR);
        expect(socketManager['_reconnectRetryCount']).toEqual(1);
      });
    });

    describe('reconnect', () => {
      it('reconnect event by attempt reconnection', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        // const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(SOCKET.RECONNECT, 123);
      });

      it('socket reconnect new url', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        // const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(SOCKET.RECONNECT, {
          body: { server: 'reconnect_url_a' },
        });
      });
    });
  });

  describe('PowerMonitor', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      syncUserConfig.getLastIndexTimestamp.mockReturnValue(1);
    });
    it('not login', () => {
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });

      powerMonitor.onPowerMonitorEvent('lock-screen');
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      powerMonitor.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    // it('logged-in and online', () => {
    //   notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
    //     state: 'online',
    //   });

    //   expect(socketManager.hasActiveFSM()).toBeFalsy();

    //   // Pre-condition: screen is locked
    //   expect(socketManager.isScreenLocked()).toBeFalsy();
    //   powerMonitor.onPowerMonitorEvent('lock-screen');

    //   // Login will not create FSM if screen is locked.
    //   notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
    //   expect(socketManager.hasActiveFSM()).toBeTruthy();
    //   const fsmName1 = socketManager.activeFSM.name;
    //   expect(!!fsmName1).toBeTruthy();
    //   expect(socketManager.isConnected()).toBeFalsy();

    //   mockedSetReconnection.mockRestore();

    //   // Will re-create FSM if socket is not connect when unlock screen
    //   powerMonitor.onPowerMonitorEvent('unlock-screen');
    //   const fsmName2 = socketManager.activeFSM.name;
    //   expect(fsmName2).not.toEqual(fsmName1);
    //   expect(socketManager.activeFSM.setReconnection).not.toHaveBeenCalled();

    //   socketManager.activeFSM.finishConnect();
    //   expect(socketManager.isConnected()).toBeTruthy();

    //   mockedSetReconnection.mockRestore();

    //   // Call setReconnection when lock screen
    //   powerMonitor.onPowerMonitorEvent('lock-screen');
    //   const fsmName3 = socketManager.activeFSM.name;
    //   expect(fsmName3).toEqual(fsmName2);
    //   expect(socketManager.activeFSM.setReconnection).not.toHaveBeenCalled();

    //   mockedSetReconnection.mockRestore();

    //   // In case socket is connected:
    //   // only call setReconnection when unlock screen,
    //   // not create new FSM
    //   powerMonitor.onPowerMonitorEvent('unlock-screen');
    //   const fsmName4 = socketManager.activeFSM.name;
    //   expect(fsmName4).toEqual(fsmName3);
    //   expect(socketManager.activeFSM.setReconnection).not.toHaveBeenCalled();
    // });
    it('logged-in and online', () => {
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      // 1. user is not log in
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // 2. the screen is locked
      powerMonitor.onPowerMonitorEvent('lock-screen');
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // 3. user is not log in and online
      powerMonitor.onPowerMonitorEvent('unlock-screen');
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // 4. login user
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager.hasActiveFSM).toBeTruthy();

      // 4. now lock the screen
      powerMonitor.onPowerMonitorEvent('lock-screen');
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName1 = socketManager.activeFSM.name;

      socketManager.activeFSM.finishConnect();
      expect(socketManager.isConnected()).toBeTruthy();

      // 5. unlock screen should not create new FSM
      powerMonitor.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName2 = socketManager.activeFSM.name;
      expect(fsmName1).toEqual(fsmName2);

      // 6. unlock screen should create new FSM
      socketManager.activeFSM.fireDisconnect();
      expect(socketManager.isConnected()).toBeFalsy();
      powerMonitor.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName3 = socketManager.activeFSM.name;
      expect(fsmName3).not.toEqual(fsmName2);
    });

    it('logged-in and offline', () => {
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName1 = socketManager.activeFSM.name;
      expect(!!fsmName1).toBeTruthy();
      expect(socketManager.isConnected()).toBeFalsy();
      mockedSetReconnection.mockRestore();

      // Pre-condition: offline, screen is locked
      powerMonitor.onPowerMonitorEvent('lock-screen');

      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'offline',
      });
      expect(socketManager.isOffline()).toBeTruthy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      mockedSetReconnection.mockRestore();

      // In case offline, unlock-screen will not create new FSM
      powerMonitor.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    it('online event', () => {
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.isOffline()).toBeFalsy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, { success: true });
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName1 = socketManager.activeFSM.name;
      expect(!!fsmName1).toBeTruthy();
      expect(socketManager.isConnected()).toBeFalsy();
      mockedSetReconnection.mockRestore();

      // Pre-condition: screen is locked
      powerMonitor.onPowerMonitorEvent('lock-screen');

      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'offline',
      });
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // In case screen is locked, not create new FSM when it becomes online
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'offline',
      });
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      powerMonitor.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      socketManager['_reconnectRetryCount'] = 10;
      socketManager['_canReconnectController'] = new SocketCanConnectController(
        {},
      );
      // online will create new FSM
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.isOffline()).toBeFalsy();
      const fsmName2 = socketManager.activeFSM.name;
      expect(!!fsmName2).toBeTruthy();
      expect(fsmName2).not.toEqual(fsmName1);
      expect(socketManager['_reconnectRetryCount']).toEqual(0);
      expect(
        socketManager['_canReconnectController'].cleanup,
      ).toHaveBeenCalled();
    });
  });

  describe('_stateHandler', () => {
    it('connected event', () => {
      socketManager['_reconnectRetryCount'] = 1;
      socketManager['_stateHandler']({
        name: '',
        state: 'connected',
        isManualStopped: false,
      });
      expect(socketManager['_reconnectRetryCount']).toEqual(0);
    });
  });
});
