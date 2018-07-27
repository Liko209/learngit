/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { SocketManager } from '../SocketManager';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE, CONFIG, SOCKET } from '../../../service/eventKey';
import { daoManager, ConfigDao } from '../../../dao';
import SocketIO from '../__mocks__/socket';
import { SocketClient } from 'foundation';

jest.mock('foundation/network');
jest.mock('../../../dao');

describe('Socket Manager', () => {
  const socketManager = SocketManager.getInstance();

  let configDao: ConfigDao;
  const test_url = 'test_url';
  const mock = {
    type: '',
    payload: test_url
  };

  beforeAll(() => {
    SocketClient.prototype.socket = new SocketIO();
    configDao = new ConfigDao(null);
  });

  beforeEach(() => {
    daoManager.getKVDao.mockReturnValue(configDao);
    configDao.get.mockReturnValue(test_url);
    mock.payload = test_url;
    notificationCenter.emitService(SERVICE.LOGOUT);
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
      expect(manager.ongoingFSMCount()).toEqual(socketManager.ongoingFSMCount());
    });

    it('login', () => {
      expect(socketManager.hasActiveFSM()).toBeFalsy();
      notificationCenter.emitService(SERVICE.LOGIN);
      expect(socketManager.hasActiveFSM()).toBeTruthy();
    });

    it('logout', () => {
      notificationCenter.emitService(SERVICE.LOGOUT);
      expect(socketManager.hasActiveFSM()).toBeFalsy();
    });

    describe('network_change', () => {
      it('online before logged in', () => {
        notificationCenter.emitService(SERVICE.LOGOUT);
        expect(socketManager.hasActiveFSM()).toBeFalsy();
        notificationCenter.emitService(SOCKET.NETWORK_CHANGE, { state: 'online' });
        expect(socketManager.hasActiveFSM()).toBeFalsy();
      });

      it('online after logged in', () => {
        notificationCenter.emitService(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmNameBeforeOnline = socketManager.activeFSM.name;
        expect(!!fsmNameBeforeOnline).toBeTruthy();
        notificationCenter.emitService(SOCKET.NETWORK_CHANGE, { state: 'online' });
        const fsmNameAfterOnline = socketManager.activeFSM.name;
        expect(!!fsmNameAfterOnline).toBeTruthy();
        expect(fsmNameBeforeOnline).not.toEqual(fsmNameAfterOnline);
      });

      it('offline', () => {
        notificationCenter.emitService(SOCKET.NETWORK_CHANGE, { state: 'offline' });
        expect(socketManager.hasActiveFSM()).toBeFalsy();
      });

      it('focus', () => {
        notificationCenter.emitService(SERVICE.LOGOUT);
        notificationCenter.emitService(SOCKET.NETWORK_CHANGE, { state: 'focus' });
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        notificationCenter.emitService(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();

        socketManager.activeFSM.finishConnect();
        notificationCenter.emitService(SOCKET.NETWORK_CHANGE, { state: 'focus' });

        socketManager.activeFSM.fireDisconnect();
        notificationCenter.emitService(SOCKET.NETWORK_CHANGE, { state: 'focus' });

        notificationCenter.emitService(SOCKET.NETWORK_CHANGE, { state: 'refresh' });
      });
    });

    describe('server_host_updated', () => {
      it('not login', () => {
        notificationCenter.emitService(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeFalsy();

        configDao.get.mockReturnValue('new_url_server_host_updated');
        notificationCenter.emitService(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeFalsy();
      });

      it('invalid new url', () => {
        notificationCenter.emitService(SERVICE.LOGIN);
        const fsmName1 = socketManager.activeFSM.name;

        configDao.get.mockReturnValue('');
        notificationCenter.emitService(CONFIG.SOCKET_SERVER_HOST);
        const fsmName2 = socketManager.activeFSM.name;
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(fsmName1).toEqual(fsmName2);
      });

      it('url no changed', () => {
        notificationCenter.emitService(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitService(CONFIG.SOCKET_SERVER_HOST);
        const fsmName2 = socketManager.activeFSM.name;
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        expect(fsmName1).toEqual(fsmName2);
      });

      it('url changed', () => {
        notificationCenter.emitService(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName1 = socketManager.activeFSM.name;

        socketManager.activeFSM.finishConnect();

        configDao.get.mockReturnValue('new_url_changed');
        notificationCenter.emitService(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName2 = socketManager.activeFSM.name;
        expect(fsmName1).not.toEqual(fsmName2);

        socketManager.activeFSM.finishConnect();

        configDao.get.mockReturnValue(test_url);
        notificationCenter.emitService(CONFIG.SOCKET_SERVER_HOST);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        const fsmName3 = socketManager.activeFSM.name;
        expect(fsmName3).toEqual(fsmName2);
      });
    });

    describe('reconnect', () => {
      it('reconnect event by attempt reconnection', () => {
        notificationCenter.emitService(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        //const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitService(SOCKET.RECONNECT, 123);
      });

      it('socket reconnect new url', () => {
        notificationCenter.emitService(SERVICE.LOGIN);
        expect(socketManager.hasActiveFSM()).toBeTruthy();
        //const fsmName1 = socketManager.activeFSM.name;

        notificationCenter.emitService(SOCKET.RECONNECT, { body: { server: 'reconnect_url_a' }});
      });
    });
  });
});
