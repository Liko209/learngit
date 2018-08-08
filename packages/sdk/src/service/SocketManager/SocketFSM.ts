/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 15:18:29
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from '../../service/notificationCenter';
import { SOCKET } from '../../service/eventKey';
import { mainLogger, SocketClient } from 'foundation';
import StateMachine from 'ts-javascript-state-machine';
import dataDispatcher from '../../component/DataDispatcher';

const SOCKET_LOGGER = 'SOCKET_LOGGER';

export class SocketFSM extends StateMachine {
  private static instanceID: number = 0;
  socketClient: any = null;

  protected isStopped: boolean = false;
  protected latestPongTime: number = 0;

  private logPrefix: string = '';

  constructor(public serverUrl: string, public glipToken: string) {
    super({
      transitions: [
        { name: 'init', from: 'none', to: 'idle' },
        { name: 'start', from: 'idle', to: 'connecting' },
        { name: 'stop', from: 'disconnected', to: 'disconnected' },
        { name: 'stop', from: 'disconnecting', to: 'disconnecting' },
        { name: 'stop', from: ['connecting', 'connected'], to: 'disconnecting' },
        { name: 'finishConnect', from: 'connecting', to: 'connected' },
        { name: 'failConnect', from: 'connecting', to: 'disconnected' },
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
          this.info(`onEnterState ${this.state}`);
          // TO-DO: move out to manager?
          notificationCenter.emit(SOCKET.STATE_CHANGE, {
            state: this.state,
          });
        },

        onInit() {
          this.info(`onInit ${this.state}`);
          this.socketClient = new SocketClient(this.serverUrl, this.glipToken);
          this.registerSocketEvents();
        },

        onStart() {
          this.socketClient.socket.connect();
        },

        onStop() {
          this.isStopped = true;
          setTimeout(() => {
            if (this.socketClient && this.socketClient.socket) {
              this.socketClient.socket.reconnection = false;
              this.socketClient.socket.disconnect();
            }
            // TO-DO: to be test
            // for connecting state, will have a follow-up socket disconnect event?
            if (this.state === 'disconnected') {
              this.cleanup();
            }
          });
        },

        onFinishConnect() {

        },

        onFireDisconnect() {
          if (this.isStopped) {
            this.cleanup();
          }
        },
      },
    });

    SocketFSM.instanceID += 1;
    this.name = `_FSM${SocketFSM.instanceID}`;
    this.logPrefix = `[${SOCKET_LOGGER} ${this.name}]`;

    this.info(`serverUrl: ${this.serverUrl}`);
    this.init();
  }

  public info(message: string) {
    mainLogger.info(`${this.logPrefix} ${message}`);
  }

  public warn(message: string) {
    mainLogger.warn(`${this.logPrefix} ${message}`);
  }

  public error(message: string) {
    mainLogger.error(`${this.logPrefix} ${message}`);
  }

  cleanup() {
    if (this.socketClient) {
      if (this.socketClient.socket) {
        this.socketClient.socket.removeAllListeners();
        this.socketClient.socket = null;
        this.info('cleanup done.');
      }
      this.socketClient = null;
    }
  }

  protected registerSocketEvents() {
    this.socketClient.socket.on('connect', (data: any) => {
      this.info(`socket-> connect. ${data || ''}`);
      this.finishConnect();
    });

    this.socketClient.socket.on('connect_error', (data: any) => {
      this.info(`socket-> connect_error. ${data || ''}`);
      this.failConnect();
    });

    this.socketClient.socket.on('connect_timeout', (data: any) => {
      this.info(`socket-> connect_timeout. ${data || ''}`);
    });

    this.socketClient.socket.on('connecting', (data: any) => {
      this.info(`socket-> connecting. ${data || ''}`);
    });

    this.socketClient.socket.on('disconnect', (data: any) => {
      this.info(`socket-> disconnect. ${data || ''}`);
      this.fireDisconnect();
    });

    this.socketClient.socket.on('error', (data: any) => {
      this.info(`socket-> error. ${data || ''}`);
    });

    this.socketClient.socket.on('reconnect', (data: any) => {
      this.info(`socket-> reconnect. ${data || ''}`);
      notificationCenter.emit(SOCKET.RECONNECT, data);
    });

    this.socketClient.socket.on('reconnect_attempt', (data: any) => {
      this.info(`socket-> reconnect_attempt. ${data || ''}`);
    });

    this.socketClient.socket.on('reconnect_failed', (data: any) => {
      this.info(`socket-> reconnect_failed. ${data || ''}`);
    });

    this.socketClient.socket.on('reconnect_error', (data: any) => {
      this.info(`socket-> reconnect_error. ${data || ''}`);
    });

    this.socketClient.socket.on('reconnecting', (data: any) => {
      this.info(`socket-> reconnecting. ${data || ''}`);
      this.fireTryReconnect();
    });

    this.socketClient.socket.on('ping', (data: any) => {
      this.info(`socket-> ping. ${data || ''}`);
    });

    this.socketClient.socket.on('pong', (data: any) => {
      this.info(`socket-> pong. ${data || ''}`);
      this.latestPongTime = new Date().getTime();
      this.info(`latestPongTime ${this.latestPongTime}`);
    });

    this.socketClient.socket.on('presense', (data: any) => {
      this.info(`socket-> presense. ${data || ''}`);
      // TO-DO: move out
      notificationCenter.emit(SOCKET.PRESENCE, data);
    });

    this.socketClient.socket.on('message', (data: any) => {
      this.info(`socket-> message. ${data || ''}`);
      dataDispatcher.onDataArrived(data);
    });

    this.socketClient.socket.on('partial', (data: any) => {
      this.info(`socket-> partial. ${data || ''}`);
    });

    this.socketClient.socket.on('response', (data: any) => {
      this.info(`socket-> response. ${data || ''}`);
    });

    this.socketClient.socket.on('typing', (data: any) => {
      this.info(`socket-> typing. ${data || ''}`);
    });

    this.socketClient.socket.on('system_message', (data: any) => {
      dataDispatcher.onDataArrived(data);
      this.info(`socket-> system_message. ${data || ''}`);
    });

    this.socketClient.socket.on('client_config', (data: any) => {
      this.info(`socket-> client_config. ${data || ''}`);
    });

    this.socketClient.socket.on('glip_ping', (data: any) => {
      this.info(`socket-> glip_ping. ${data || ''}`);
    });

    this.socketClient.socket.on('glip_pong', (data: any) => {
      this.info(`socket-> glip_pong. ${data || ''}`);
    });
  }
}
