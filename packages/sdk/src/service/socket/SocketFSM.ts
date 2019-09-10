/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 15:18:29
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from '../notificationCenter';
import { SOCKET } from '../eventKey';
import { mainLogger } from 'foundation/log';
import { SocketClient } from 'foundation/network';
import StateMachine from 'ts-javascript-state-machine';
import dataDispatcher from '../../component/DataDispatcher';
import { GlipPingPong } from './GlipPingPong';

const SOCKET_LOGGER = 'SOCKET';

type StateHandlerType = {
  name: string;
  state: string;
  isManualStopped: boolean;
};
type StateHandler = (value: StateHandlerType) => any;
type GlipPingPongStatusCallback = (isSuccess: boolean) => void;
export class SocketFSM extends StateMachine {
  private static instanceID: number = 0;
  socketClient: any = null;
  protected latestPongTime: number = 0;
  private _glipPingPong?: GlipPingPong;
  protected isManualStopped: boolean = false;
  private logPrefix: string = '';
  // @ts-ignore
  private _startSocket: boolean = false; // @ts-ignore

  constructor(
    public serverUrl: string,
    public glipToken: string,
    public stateHandler: StateHandler,
    public glipPingPongStatusCallback: GlipPingPongStatusCallback,
  ) {
    super({
      transitions: [
        { name: 'init', from: 'none', to: 'idle' },
        { name: 'start', from: 'idle', to: 'connecting' },
        { name: 'stop', from: 'disconnected', to: 'disconnected' },
        { name: 'stop', from: 'disconnecting', to: 'disconnecting' },
        {
          name: 'stop',
          from: ['connecting', 'connected'],
          to: 'disconnecting',
        },
        { name: 'finishConnect', from: 'connecting', to: 'connected' },
        {
          name: 'failConnect',
          from: ['connecting', 'disconnecting'],
          to: 'disconnected',
        },
        {
          name: 'fireDisconnect',
          from: ['connecting', 'disconnecting', 'connected'],
          to: 'disconnected',
        },
        { name: 'fireTryReconnect', from: 'disconnected', to: 'connecting' },
      ],
      methods: {
        onInvalidTransition(transition: any, from: any, to: any) {
          this.error(`onInvalidTransition ${transition}: ${from} => ${to}`);
        },

        onPendingTransition(transition: any, from: any, to: any) {
          this.warn(`onPendingTransition ${transition}: ${from} => ${to}`);
        },

        onTransition(lc: StateMachine.LifeCycle) {
          this.info(`onTransition ${lc.transition}: ${lc.from} => ${lc.to}`);
          return true;
        },

        onEnterState() {
          this.info(
            `onEnterState ${this.state} isManualStopped:${
              this.isManualStopped
            }`,
          );

          if (this.stateHandler) {
            this.stateHandler({
              name: this.name,
              state: this.state,
              isManualStopped: this.isManualStopped,
            });
          }
        },

        onInit() {
          this.info(`onInit ${this.state}`);
          this.socketClient = new SocketClient(this.serverUrl, this.glipToken);
          this._glipPingPong = new GlipPingPong({
            socket: this.socketClient.socket,
            callback: this.fsmGlipPingPongCallback.bind(this),
          });
          this.registerSocketEvents();
        },

        onStart() {
          this._startSocket = true;
          this.socketClient.socket.connect();
        },

        onStop() {
          this.isManualStopped = true;
          setTimeout(() => {
            if (this.socketClient && this.socketClient.socket) {
              this.socketClient.socket.reconnection = false;
              this._startSocket && this.socketClient.socket.disconnect();
            }
            this.cleanup();
          });
        },

        onFinishConnect() {},

        onFireDisconnect() {
          this.cleanup();
        },
      },
    });

    SocketFSM.instanceID += 1;
    this.name = `_FSM${SocketFSM.instanceID}`;
    this.logPrefix = `[${SOCKET_LOGGER} ${this.name}]`;

    this.info(`serverUrl: ${this.serverUrl}`);
    this.init();
  }

  public info(...messages: any) {
    mainLogger.tags(this.logPrefix).info(...messages);
  }

  public warn(...messages: any) {
    mainLogger.tags(this.logPrefix).warn(...messages);
  }

  public error(...messages: any) {
    mainLogger.tags(this.logPrefix).error(...messages);
  }

  public isConnected() {
    return this.state === 'connected';
  }

  public isStateDisconnected() {
    return this.state === 'disconnected';
  }

  public stopFSM() {
    this.info('stopping FSM');
    this.isManualStopped = true;
    delete this.glipPingPongStatusCallback;
    delete this.stateHandler;
    if (
      this.socketClient &&
      this.socketClient.socket &&
      !this.socketClient.socket.disconnected
    ) {
      this.stop();
    } else {
      this.cleanup();
    }
  }

  public setReconnection(bOn: boolean) {
    if (
      this.socketClient &&
      this.socketClient.socket &&
      this.socketClient.socket.io
    ) {
      this.info(
        `setReconnection: ${
          this.socketClient.socket.io._reconnection
        } ==> ${bOn}`,
      );
      this.socketClient.socket.io.reconnection(bOn);
    } else {
      this.warn(`setReconnection: ==> ${bOn}. Error: no socket`);
    }
  }

  cleanup() {
    this.info('cleaning socketFSM');
    this._startSocket = false;
    if (this._glipPingPong) {
      this._glipPingPong.cleanup();
      this._glipPingPong = undefined;
      this.info('glip ping pong cleanup done.');
    }
    if (this.socketClient) {
      if (this.socketClient.socket) {
        this.socketClient.socket.removeAllListeners();
        this.socketClient.socket.destroy();
        delete this.socketClient.socket;
        this.socketClient.socket = null;
        this.info('socket client cleanup done.');
      }
      this.socketClient = null;
    }
  }

  public doGlipPing() {
    this.info(
      `check if socket is connected, isStateConnected: ${this.isConnected()}`,
    );
    this.isConnected() &&
      this._glipPingPong &&
      this._glipPingPong.ping((success: boolean) => {
        this.info('check socket and it is ping result is:', success);
      });
  }

  protected registerSocketEvents() {
    this.socketClient.socket.on('connect', (data: any) => {
      this.info('socket-> connect. ', data);
      this.finishConnect();
    });

    this.socketClient.socket.on('connect_error', (data: any) => {
      this.info('socket-> connect_error. ', data);
      this.failConnect();
      notificationCenter.emit(SOCKET.CONNECT_ERROR);
    });

    this.socketClient.socket.on('connect_timeout', (data: any) => {
      this.info('socket-> connect_timeout. ', data);
    });

    this.socketClient.socket.on('connecting', (data: any) => {
      this.info('socket-> connecting. ', data);
    });

    this.socketClient.socket.on('disconnect', (data: any) => {
      this.info('socket-> disconnect. ', data);
      this.fireDisconnect();
    });

    this.socketClient.socket.on('error', (data: any) => {
      this.info('socket-> error. ', data);
      notificationCenter.emit(SOCKET.ERROR);
    });

    this.socketClient.socket.on('reconnect', (data: any) => {
      this.info('socket-> reconnect. ', data);
      notificationCenter.emit(SOCKET.RECONNECT, data);
    });

    this.socketClient.socket.on('reconnect_attempt', (data: any) => {
      this.info('socket-> reconnect_attempt. ', data);
    });

    this.socketClient.socket.on('request_timeout', (data: any) => {
      this.info('socket-> request_timeout. ', data);
      this.doGlipPing();
    });

    this.socketClient.socket.on('reconnect_failed', (data: any) => {
      this.info('socket-> reconnect_failed. ', data);
    });

    this.socketClient.socket.on('reconnect_error', (data: any) => {
      this.info('socket-> reconnect_error. ', data);
    });

    this.socketClient.socket.on('reconnecting', (data: any) => {
      this.info('socket-> reconnecting. ', data);
      this.fireTryReconnect();
    });

    this.socketClient.socket.on('ping', (data: any) => {
      this.info('socket-> ping. ', data);
    });

    this.socketClient.socket.on('pong', (data: any) => {
      this.info('socket-> pong. ', data);
      this.latestPongTime = new Date().getTime();
      this.info(`latestPongTime ${this.latestPongTime}`);
    });

    this.socketClient.socket.on('presence_unified', (data: any) => {
      dataDispatcher.onDataArrived('presence_unified', data);
    });

    this.socketClient.socket.on('message', (data: any) => {
      this.info('socket-> message. ', data);
      dataDispatcher.onDataArrived('message', data);
    });

    this.socketClient.socket.on('partial', (data: any) => {
      dataDispatcher.onDataArrived('partial', data, true);
      this.info('socket-> partial. ', data);
    });

    this.socketClient.socket.on('response', (data: any) => {
      this.info('socket-> response. ', data);
    });

    this.socketClient.socket.on('typing', (data: any) => {
      dataDispatcher.onDataArrived('typing', data);
      this.info('socket-> typing. ', data);
    });

    this.socketClient.socket.on('system_message', (data: any) => {
      dataDispatcher.onDataArrived('system_message', data);
      this.info('socket-> system_message. ', data);
    });

    this.socketClient.socket.on('client_config', (data: any) => {
      this.info('socket-> client_config. ', data);
    });
  }
  protected fsmGlipPingPongCallback(success: boolean) {
    this.info(
      ` glipPingPongCallback success: ${success} state:${
        this.state
      } isManualStopped :${this.isManualStopped}`,
    );
    this.glipPingPongStatusCallback && this.glipPingPongStatusCallback(success);
  }
}

export { StateHandlerType };
