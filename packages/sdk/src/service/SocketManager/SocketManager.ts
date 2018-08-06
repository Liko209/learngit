/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 16:59:44
 * Copyright © RingCentral. All rights reserved.
 */
import { SocketFSM } from './SocketFSM';
import notificationCenter from '../../service/notificationCenter';
import { CONFIG, SOCKET, SERVICE } from '../../service/eventKey';
import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import AuthDao from '../../dao/auth';
import { AUTH_GLIP_TOKEN } from '../../dao/auth/constants';
import { SOCKET_SERVER_HOST } from '../../dao/config/constants';
import { mainLogger } from 'foundation';

const SOCKET_LOGGER = 'SOCKET_LOGGER';
export class SocketManager {
  private static instance: SocketManager;
  activeFSM: any = null;

  private logPrefix: string;
  // private activeFSM: any = null;
  private closeingFSMs: { [key: string]: SocketFSM } = {};
  private successConnectedUrls: string[] = [];
  private hasLoggedIn: boolean = false;

  private constructor() {
    this.logPrefix = `[${SOCKET_LOGGER} manager]`;

    this._subscribeExternalEvent();
  }

  public static getInstance() {
    if (!SocketManager.instance) {
      mainLogger.info(`[${SOCKET_LOGGER} manager] getInstance`);
      SocketManager.instance = new SocketManager();
    }

    return SocketManager.instance;
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

  public hasActiveFSM() {
    return this.activeFSM !== null;
  }

  public ongoingFSMCount() {
    let count = 0;

    if (this.activeFSM) {
      count += 1;
    }

    if (this.closeingFSMs) {
      count += Object.keys(this.closeingFSMs).length;
    }

    return count;
  }

  private _subscribeExternalEvent() {
    //  TO-DO: to be test. Should get this event once
    // 1. get scoreboard event from IDL
    // 2. get socket reconnect event
    notificationCenter.on(SERVICE.LOGIN, () => {
      this._onLogin();
    });

    notificationCenter.on(SERVICE.LOGOUT, () => {
      this._onLogout();
    });

    notificationCenter.on(CONFIG.SOCKET_SERVER_HOST, () => {
      this._onServerHostUpdated();
    });

    notificationCenter.on(SOCKET.STATE_CHANGE, ({ state }: { state: any }) => {
      this._onSocketStateChanged(state);
    });

    notificationCenter.on(SOCKET.NETWORK_CHANGE, ({ state }: any) => {
      switch (state) {
        case 'offline':
          this._onOffline();
          break;
        case 'online':
          this._onOnline();
          break;
        case 'focus':
          this._onFocus();
          break;
        default:
          break;
      }
    });

    notificationCenter.on(SOCKET.RECONNECT, (data: any) => {
      this._onReconnect(data);
    });

    // TO-DO: /can-connect API reponse.
  }

  private _onLogin() {
    this.info('onLogin');
    this.hasLoggedIn = true;
    this.successConnectedUrls = [];
    this._stopActiveFSM();
    this._startFSM();
  }

  private _onLogout() {
    this.info('onLogout');
    this.hasLoggedIn = false;
    this._stopActiveFSM();
  }

  private _onServerHostUpdated() {
    const hasActive = this.hasActiveFSM();
    const configDao = daoManager.getKVDao(ConfigDao);
    const serverUrl = configDao.get(SOCKET_SERVER_HOST);
    // tslint:disable-next-line:max-line-length
    this.info(`onServerHostUpdated: ${serverUrl}, hasLoggedIn: ${this.hasLoggedIn}, hasActiveFSM: ${hasActive}`);
    if (!this.hasLoggedIn) {
      this.info(`Ignore server updated event due to not logged-in`);
      return;
    }
    // Ignore invalid url
    if (!serverUrl) {
      this.info(`Server URL is changed, but it is an invalid URL.`);
      return;
    }

    const runningUrl = this.activeFSM && this.activeFSM.serverUrl;
    if (runningUrl !== serverUrl) {
      this.info(`serverUrl changed: ${runningUrl} ==> ${serverUrl}`);

      /* To avoid run into death loop in such case:
          scoreboard from /index is different to which from socket reconnect event.
          Solution:
          Save the URL which is connected success, ignore reseting to these tried URLs
      */
      const isNewUrl = this.successConnectedUrls.indexOf(serverUrl) === -1;
      if (!hasActive || isNewUrl) {
        // tslint:disable-next-line:max-line-length
        this.info(`Restart due to serverUrl update. hasActive: ${hasActive}, isNewUrl: ${isNewUrl}`);
        this._stopActiveFSM();
        this._startFSM();
      } else if (!isNewUrl) {
        this.warn(`Server URL is changed, but it is used before.`);
      }
    }
  }

  private _onSocketStateChanged(state: string) {
    if (state === 'connected') {
      const activeState = this.activeFSM && this.activeFSM.state;
      if (state === activeState) {
        const activeUrl = this.activeFSM.serverUrl;
        if (this.successConnectedUrls.indexOf(activeUrl) === -1) {
          this.successConnectedUrls.push(activeUrl);
        }
      } else {
        this.warn(`Invalid activeState: ${activeState}`);
      }
    }
  }

  private _onOffline() {
    this.info('onOffline');
    this._stopActiveFSM();
  }

  private _onOnline() {
    this.info('onOnline');
    if (!this.hasLoggedIn) {
      this.info(`Ignore online event due to not logged-in`);
      return;
    }

    this._stopActiveFSM();
    this._startFSM();
  }

  private _onFocus() {
    if (!this.activeFSM) return;

    const state = this.activeFSM.state;
    // TO-DO:
    if (state !== 'connected' && state !== 'connecting') {
      notificationCenter.emit(SOCKET.STATE_CHANGE, {
        state: 'refresh',
      });
    }
  }

  private _onReconnect(data: any) {
    // socket emit reconnect
    if (typeof data === 'number') return;

    try {
      const body = JSON.parse(data.body);
      const configDao = daoManager.getKVDao(ConfigDao);
      configDao.put(SOCKET_SERVER_HOST, body.server);
      notificationCenter.emitConfigPut(CONFIG.SOCKET_SERVER_HOST, body.server);
    } catch (error) {
      this.warn(`fail on socket reconnect: ${error}`);
    }
  }

  private _startFSM() {
    // TO-DO: 1. jitter 2. ignore for same serverURL when activeFSM is connected?
    const authDao = daoManager.getKVDao(AuthDao);
    const configDao = daoManager.getKVDao(ConfigDao);
    const glipToken = authDao.get(AUTH_GLIP_TOKEN);
    const serverHost = configDao.get(SOCKET_SERVER_HOST);
    if (serverHost) {
      this.activeFSM = new SocketFSM(serverHost, glipToken);
      this.activeFSM.start();
    }

    // TO-DO: should subscribe closed event to remove self from mananger?
  }

  private _stopActiveFSM() {
    if (this.activeFSM) {
      this.activeFSM.stop();
      // this.closeingFSMs[this.activeFSM.name] = this.activeFSM;
      this.activeFSM = null;
    }
  }
}
