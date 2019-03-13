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
import { SyncUserConfig } from '../../../module/sync/config/SyncUserConfig';

jest.mock('../../../module/config');

GlobalConfigService.getInstance = jest.fn();

jest.mock('foundation/src/network/client/socket');
jest.mock('../../../dao');
const mockedSetReconnection = jest.fn((bOn: boolean) => {});
SocketFSM.prototype = {
  ...SocketFSM.prototype,
  setReconnection: mockedSetReconnection,
};

jest.mock('../../../module/sync/config/SyncUserConfig', () => {
  const config = {
    getSocketServerHost: jest.fn(),
    setSocketServerHost: jest.fn(),
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
  const test_url = 'test_url';
  const mock = {
    type: '',
    payload: test_url,
  };

  beforeAll(() => {
    SocketClient.prototype.socket = new SocketIO();
  });

  function setUp() {
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

    it('login', () => {
      expect(socketManager.hasActiveFSM()).toBeFalsy();
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
        notificationCenter.emitKVChange(SERVICE.LOGOUT);
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'focus',
        });
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        notificationCenter.emitKVChange(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();

        socketManager.activeFSM.finishConnect();
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'focus',
        });

        socketManager.activeFSM.fireDisconnect();
        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'focus',
        });

        notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
          state: 'refresh',
        });
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
        notificationCenter.emitKVChange(SERVICE.LOGIN);
        const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        const fsmName2 = socketManager.activeFSM.name;
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(fsmName1).toEqual(fsmName2);
      });

      it('url no changed', () => {
        notificationCenter.emitKVChange(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST);
        const fsmName2 = socketManager.activeFSM.name;
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(fsmName1).toEqual(fsmName2);
      });

      it('url changed', () => {
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
        notificationCenter.emitKVChange(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        // const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitKVChange(SOCKET.RECONNECT, 123);
      });

      it('socket reconnect new url', () => {
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

    it('logged-in and online', () => {
      notificationCenter.emitKVChange(SOCKET.NETWORK_CHANGE, {
        state: 'online',
      });

      expect(socketManager.hasActiveFSM()).toBeFalsy();

      // Pre-condition: screen is locked
      expect(socketManager.isScreenLocked()).toBeFalsy();
      socketManager.onPowerMonitorEvent('lock-screen');
      expect(socketManager.isScreenLocked()).toBeTruthy();

      // Login will create FSM even if screen is locked.
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeTruthy();
      const fsmName1 = socketManager.activeFSM.name;
      expect(!!fsmName1).toBeTruthy();
      expect(socketManager.isConnected()).toBeFalsy();

      mockedSetReconnection.mockRestore();

      // Will re-create FSM if socket is not connect when unlock screen
      socketManager.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.isScreenLocked()).toBeFalsy();
      const fsmName2 = socketManager.activeFSM.name;
      expect(fsmName2).not.toEqual(fsmName1);
      expect(socketManager.activeFSM.setReconnection).not.toHaveBeenCalled();

      socketManager.activeFSM.finishConnect();
      expect(socketManager.isConnected()).toBeTruthy();

      mockedSetReconnection.mockRestore();

      // Call setReconnection when lock screen
      socketManager.onPowerMonitorEvent('lock-screen');
      expect(socketManager.isScreenLocked()).toBeTruthy();
      const fsmName3 = socketManager.activeFSM.name;
      expect(fsmName3).toEqual(fsmName2);
      expect(socketManager.activeFSM.setReconnection).toHaveBeenNthCalledWith(
        1,
        false,
      );

      mockedSetReconnection.mockRestore();

      // In case socket is connected:
      // only call setReconnection when unlock screen,
      // not create new FSM
      socketManager.onPowerMonitorEvent('unlock-screen');
      expect(socketManager.isScreenLocked()).toBeFalsy();
      const fsmName4 = socketManager.activeFSM.name;
      expect(fsmName4).toEqual(fsmName3);
      expect(socketManager.activeFSM.setReconnection).toHaveBeenNthCalledWith(
        1,
        true,
      );
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
