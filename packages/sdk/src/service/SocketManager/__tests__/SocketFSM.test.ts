/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 17:00:08
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { SocketFSM } from '../SocketFSM';
import { mainLogger, SocketClient } from 'foundation';
import SocketIO from '../__mocks__/socket';

jest.mock('foundation');

describe('Socket FSM', async () => {
  const serverUrl = 'aws13-g04-uds02.asialab.glip.net:11904';
  function fsmCreate() {
    const fsm = new SocketFSM(serverUrl);
    return fsm;
  }

  function emit(fsm: SocketFSM, event: string, opts?: any) {
    fsm.socketClient.socket.emit(event, opts);
  }
  beforeEach(() => {
    SocketClient.prototype.socket = new SocketIO();
    jest.spyOn(window, 'setTimeout').mockImplementation(cb => cb());
  });
  afterEach(() => {
    window.setTimeout.mockRestore();
  });

  describe('instance', () => {
    it('instance will trigger onInit', async () => {
      const fsm = fsmCreate();
      expect(fsm.state).toBe('idle');
      expect(fsm.socketClient).not.toBeNull();
    });

    it('instance name is only', async () => {
      const fsm = fsmCreate();
      const fsm1 = fsmCreate();
      expect(fsm.name).not.toEqual(fsm1.name);
    });
  });

  describe('state transition', () => {
    it('start(): state will change connecting', async () => {
      const fsm = fsmCreate();
      fsm.start();
      expect(fsm.state).toBe('connecting');
    });

    it('stop(): state will from: [connecting or connected], to: disconnecting', async () => {
      const fsm = fsmCreate();
      fsm.start(); // connecting
      fsm.stop();
      expect(fsm.state).toBe('disconnecting');
    });

    it('stop(): state will from: disconnected, to: disconnected', async () => {
      const fsm = fsmCreate();
      fsm.start();
      fsm.failConnect(); // disconnected
      fsm.stop();
      expect(fsm.state).toBe('disconnected');
    });

    it('stop(): state will from: disconnecting, to: disconnecting', async () => {
      const fsm = fsmCreate();
      fsm.start();
      fsm.stop(); // disconnecting
      fsm.stop();
      expect(fsm.state).toBe('disconnecting');
    });

    it('fireDisconnect(): ', () => {
      const fsm = fsmCreate();
      fsm.start();
      fsm.stop();
      fsm.fireDisconnect();
      expect(fsm.state).toBe('disconnected');
    });

    it('pending transition', () => {
      const fsm = fsmCreate();
      fsm.onEnterConnecting = () => {
        fsm.failConnect();
      };
      fsm.start();
      expect(fsm.state).toBe('connecting');
    });
  });

  describe('Invalid state transition', () => {
    it('onInvalidTransition(): will trigger when the change of state is incorrect ', () => {
      const fsm = fsmCreate();
      const spy = jest.spyOn(mainLogger, 'error');
      fsm.stop(); // idle => disconnecting is incorrect
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      spy.mockRestore();
    });
  });

  // TODO : when will trigger?
  describe('pending state transition', () => {
    it('onPendingTransition(): will trigger', () => {
      const fsm = fsmCreate();
      fsm.init();
      fsm.start();
    });
  });

  describe('SocketEvents', () => {
    // for cover
    it('reconnect', () => {
      const fsm = fsmCreate();
      fsm.start();
      emit(fsm, 'reconnect');
      emit(fsm, 'reconnect_error');
      emit(fsm, 'reconnect_failed');
      emit(fsm, 'error');
      expect(fsm.state).toBe('connecting');
    });
    it('connect success', () => {
      const fsm = fsmCreate();
      fsm.start();
      fsm.socketClient.socket.connect.mockResolvedValue(
        (() => {
          emit(fsm, 'connecting');
          emit(fsm, 'connect');
          emit(fsm, 'ping');
          emit(fsm, 'pong');
          emit(fsm, 'presense');
          emit(
            fsm,
            'message',
            JSON.stringify({
              body: {
                objects: [[{ id: 1 }]],
              },
            }),
          );
          emit(fsm, 'partial');
          emit(fsm, 'response');
          emit(fsm, 'typing');
          emit(fsm, 'system_message');
          emit(fsm, 'client_config');
          emit(fsm, 'glip_ping');
          emit(fsm, 'glip_pong');
        })(),
      );
    });

    it('fail connect and auto recover', () => {
      const fsm = fsmCreate();
      fsm.start();
      fsm.socketClient.socket.connect.mockResolvedValue(
        (() => {
          const spy = jest.spyOn(fsm, 'cleanup');
          emit(fsm, 'connecting');
          expect(fsm.state).toBe('connecting');
          emit(fsm, 'connect_timeout');
          emit(fsm, 'connect_error');
          expect(fsm.state).toBe('disconnected');
          expect(spy).toHaveBeenCalledTimes(0);

          emit(fsm, 'reconnect_attempt');
          emit(fsm, 'reconnecting');
          expect(fsm.state).toBe('connecting');
          emit(fsm, 'connect_error');
          expect(fsm.state).toBe('disconnected');

          emit(fsm, 'reconnect_attempt');
          emit(fsm, 'reconnecting');
          emit(fsm, 'connect');
          expect(fsm.state).toBe('connected');

          emit(fsm, 'disconnect');
          expect(fsm.state).toBe('disconnected');
          expect(spy).toHaveBeenCalledTimes(0);

          emit(fsm, 'reconnect_attempt');
          emit(fsm, 'reconnecting');
          emit(fsm, 'connect_error');
          expect(fsm.state).toBe('disconnected');

          spy.mockReset();
          spy.mockRestore();
        })(),
      );
    });

    it('Stop when connecting', () => {
      const fsm = fsmCreate();
      fsm.start();
      fsm.socketClient.socket.connect.mockResolvedValue(
        (() => {
          emit(fsm, 'connecting');
          expect(fsm.state).toBe('connecting');
          fsm.stop();
          expect(fsm.state).toBe('disconnecting');
        })(),
      );

      fsm.socketClient.socket.disconnect.mockResolvedValue(
        (() => {
          const spy = jest.spyOn(fsm, 'cleanup');

          expect(fsm.state).toBe('disconnecting');
          expect(spy).toHaveBeenCalledTimes(0);
          expect(fsm.socketClient).not.toBeNull();

          emit(fsm, 'disconnect');
          expect(fsm.state).toBe('disconnected');
          expect(spy).toHaveBeenCalledTimes(1);
          expect(fsm.socketClient).toBeNull();
          spy.mockReset();
          spy.mockRestore();
        })(),
      );
    });

    it('Stop when disconnected', () => {
      const fsm = fsmCreate();
      fsm.start();
      fsm.socketClient.socket.connect.mockResolvedValue(
        (() => {
          const spy = jest.spyOn(fsm, 'cleanup');
          emit(fsm, 'connecting');
          expect(fsm.state).toBe('connecting');
          emit(fsm, 'connect_error');
          expect(fsm.state).toBe('disconnected');
          expect(spy).toHaveBeenCalledTimes(0);
          spy.mockReset();
          spy.mockRestore();
        })(),
      );
    });
  });
});
