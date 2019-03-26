/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { SocketManager } from '../SocketManager';
import { SocketFSM } from '../SocketFSM';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE, CONFIG, SOCKET } from '../../../service/eventKey';
import SocketIO from '../__mocks__/socket';
import { SocketClient } from 'foundation';
import { GlobalConfigService } from '../../../module/config';
import { SocketCanConnectController } from '../SocketCanConnectController';
import { getCurrentTime } from '../../../utils/jsUtils';
import { SyncUserConfig } from '../../../module/sync/config/SyncUserConfig';

jest.mock('../../../module/config');
jest.mock('../SocketCanConnectController', () => {
  const mockController: SocketCanConnectController = {
    doCanConnectApi: (callback, forceOnline) => {
      callback(1);
    },
    cleanup: () => {},
  };
  return {
    SocketCanConnectController: () => {
      return mockController;
    },
  };
});
jest.mock('../../../utils/jsUtils');
jest.mock('../../../service/config');

GlobalConfigService.getInstance = jest.fn();

jest.mock('foundation/src/network/client/socket');
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
  };
  return {
    SyncUserConfig: () => {
      return config;
    },
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

  function setUp() {
    getCurrentTime.mockReturnValue(1);
    syncUserConfig = new SyncUserConfig();
    mockedSetReconnection.mockRestore();
    syncUserConfig.getSocketServerHost = jest.fn().mockReturnValue(test_url);
    mock.payload = test_url;
    notificationCenter.emitKVChange(SERVICE.LOGOUT);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('check canReconnectController', () => {
    it('should be null when socketManager init', () => {
      expect(socketManager._canReconnectController).toBeUndefined();
    });

    it('should not be null when has active FSM', () => {
      syncUserConfig.getLastIndexTimestamp = jest.fn().mockReturnValueOnce(1);
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      expect(socketManager._canReconnectController).not.toBeUndefined();

      notificationCenter.emitKVChange(SERVICE.LOGOUT);
      expect(socketManager._canReconnectController).toBeUndefined();
    });
    it('should not have active FSM if id is incorrect', () => {
      syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
      getCurrentTime.mockReturnValue(2);
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });
  });

  describe('logger: function is normal operation', () => {
    socketManager.warn('test logger.warn');
    socketManager.error('test logger.error');
    socketManager.info('test logger.info');
  });

  describe('Event', () => {
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
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      expect(socketManager.ongoingFSMCount()).toEqual(0);
    });

    it('initial done event', () => {
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      syncUserConfig.getLastIndexTimestamp.mockReturnValue(null);
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      expect(socketManager.ongoingFSMCount()).toEqual(0);
    });

    it('initial done event', () => {
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      expect(socketManager.ongoingFSMCount()).toEqual(1);
    });

    it('logout', () => {
      notificationCenter.emitKVChange(SERVICE.LOGOUT);
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    describe('network_change', () => {
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
        notificationCenter.emitKVChange(SERVICE.LOGIN);
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
        notificationCenter.emitKVChange(SERVICE.LOGIN);
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
      it('not login', () => {
        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeFalsy();
        syncUserConfig.getSocketServerHost = jest
          .fn()
          .mockReturnValue('new_url_server_host_updated');
        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeFalsy();
      });

      it('invalid new url', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.LOGIN);
        const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        const fsmName2 = socketManager.activeFSM.name;
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(fsmName1).toEqual(fsmName2);
      });

      it('url no changed', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        const fsmName2 = socketManager.activeFSM.name;
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(fsmName1).toEqual(fsmName2);
      });

      it('url changed', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName1 = socketManager.activeFSM.name;

        socketManager.activeFSM.finishConnect();
        syncUserConfig.getSocketServerHost = jest
          .fn()
          .mockReturnValue('new_url_changed');

        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName2 = socketManager.activeFSM.name;
        expect(fsmName1).not.toEqual(fsmName2);

        socketManager.activeFSM.finishConnect();
        syncUserConfig.getSocketServerHost = jest
          .fn()
          .mockReturnValue(test_url);
        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName3 = socketManager.activeFSM.name;
        expect(fsmName3).toEqual(fsmName2);
      });
    });

    describe('reconnect', () => {
      it('reconnect event by attempt reconnection', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        // const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(SOCKET.RECONNECT, 123);
      });

      it('socket reconnect new url', () => {
        syncUserConfig.getLastIndexTimestamp.mockReturnValueOnce(1);
        notificationCenter.emitKVChange(SERVICE.LOGIN);
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
      syncUserConfig.getLastIndexTimestamp.mockReturnValue(1);
    });
    it('not login', () => {
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });

      expect(socketManager.isScreenLocked()).toBeFalsy();
      socketManager.onPowerMonitorEvent('lock-screen');
      expect(socketManager.isScreenLocked()).toBeTruthy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      socketManager.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.isScreenLocked()).toBeFalsy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    // it('logged-in and online', () => {
    //   notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
    //     state: 'online',
    //   });

    //   expect(socketManager.hasActiveFSM()).toBeFalsy();

    //   // Pre-condition: screen is locked
    //   expect(socketManager.isScreenLocked()).toBeFalsy();
    //   socketManager.onPowerMonitorEvent('lock-screen');
    //   expect(socketManager.isScreenLocked()).toBeTruthy();

    //   // Login will not create FSM if screen is locked.
    //   notificationCenter.emitKVChange(SERVICE.LOGIN);
    //   expect(socketManager.hasActiveFSM()).toBeTruthy();
    //   const fsmName1 = socketManager.activeFSM.name;
    //   expect(!!fsmName1).toBeTruthy();
    //   expect(socketManager.isConnected()).toBeFalsy();

    //   mockedSetReconnection.mockRestore();

    //   // Will re-create FSM if socket is not connect when unlock screen
    //   socketManager.onPowerMonitorEvent('unlock-screen');
    //   expect(socketManager.isScreenLocked()).toBeFalsy();
    //   const fsmName2 = socketManager.activeFSM.name;
    //   expect(fsmName2).not.toEqual(fsmName1);
    //   expect(socketManager.activeFSM.setReconnection).not.toHaveBeenCalled();

    //   socketManager.activeFSM.finishConnect();
    //   expect(socketManager.isConnected()).toBeTruthy();

    //   mockedSetReconnection.mockRestore();

    //   // Call setReconnection when lock screen
    //   socketManager.onPowerMonitorEvent('lock-screen');
    //   expect(socketManager.isScreenLocked()).toBeTruthy();
    //   const fsmName3 = socketManager.activeFSM.name;
    //   expect(fsmName3).toEqual(fsmName2);
    //   expect(socketManager.activeFSM.setReconnection).not.toHaveBeenCalled();

    //   mockedSetReconnection.mockRestore();

    //   // In case socket is connected:
    //   // only call setReconnection when unlock screen,
    //   // not create new FSM
    //   socketManager.onPowerMonitorEvent('unlock-screen');
    //   expect(socketManager.isScreenLocked()).toBeFalsy();
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
      socketManager.onPowerMonitorEvent('lock-screen');
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.isScreenLocked()).toBeTruthy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // 3. user is not log in and online
      socketManager.onPowerMonitorEvent('unlock-screen');
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.isScreenLocked()).toBeFalsy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // 4. login user
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM).toBeTruthy();

      // 4. now lock the screen
      socketManager.onPowerMonitorEvent('lock-screen');
      expect(socketManager.isScreenLocked()).toBeTruthy();
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName1 = socketManager.activeFSM.name;

      socketManager.activeFSM.finishConnect();
      expect(socketManager.isConnected()).toBeTruthy();

      // 5. unlock screen should not create new FSM
      socketManager.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName2 = socketManager.activeFSM.name;
      expect(fsmName1).toEqual(fsmName2);

      // 6. unlock screen should create new FSM
      socketManager.activeFSM.fireDisconnect();
      expect(socketManager.isConnected()).toBeFalsy();
      socketManager.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName3 = socketManager.activeFSM.name;
      expect(fsmName3).not.toEqual(fsmName2);
    });

    it('logged-in and offline', () => {
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName1 = socketManager.activeFSM.name;
      expect(!!fsmName1).toBeTruthy();
      expect(socketManager.isConnected()).toBeFalsy();
      mockedSetReconnection.mockRestore();

      // Pre-condition: offline, screen is locked
      socketManager.onPowerMonitorEvent('lock-screen');
      expect(socketManager.isScreenLocked()).toBeTruthy();

      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'offline',
      });
      expect(socketManager.isOffline()).toBeTruthy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      mockedSetReconnection.mockRestore();

      // In case offline, unlock-screen will not create new FSM
      socketManager.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.isScreenLocked()).toBeFalsy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    it('online event', () => {
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.isOffline()).toBeFalsy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName1 = socketManager.activeFSM.name;
      expect(!!fsmName1).toBeTruthy();
      expect(socketManager.isConnected()).toBeFalsy();
      mockedSetReconnection.mockRestore();

      // Pre-condition: screen is locked
      socketManager.onPowerMonitorEvent('lock-screen');
      expect(socketManager.isScreenLocked()).toBeTruthy();

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

      socketManager.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.isScreenLocked()).toBeFalsy();
      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // online will create new FSM
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });
      expect(socketManager.isOffline()).toBeFalsy();
      const fsmName2 = socketManager.activeFSM.name;
      expect(!!fsmName2).toBeTruthy();
      expect(fsmName2).not.toEqual(fsmName1);
    });
  });
});
