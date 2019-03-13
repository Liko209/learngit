/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 16:59:44
 * Copyright © RingCentral. All rights reserved.
 */
import { SocketFSM } from './SocketFSM';
import notificationCenter from '../../service/notificationCenter';
import { CONFIG, SOCKET, SERVICE } from '../../service/eventKey';
import { mainLogger } from 'foundation';
import { AuthGlobalConfig } from '../../service/auth/config';
import { SyncUserConfig } from '../../module/sync/config/SyncUserConfig';

const SOCKET_LOGGER = 'SOCKET';
export class SocketManager {
  private static instance: SocketManager;
  public activeFSM: any = null;

  private _logPrefix: string;
  private _closingFSMs: { [key: string]: SocketFSM } = {};
  private _successConnectedUrls: string[] = [];
  private _hasLoggedIn: boolean = false;
  private _isScreenLocked: boolean = false;
  private _isOffline: boolean = false;

  private constructor() {
    this._logPrefix = `[${SOCKET_LOGGER} manager]`;

    this._subscribeExternalEvent();
  }

  public static getInstance() {
    if (!SocketManager.instance) {
      mainLogger.info(`[${SOCKET_LOGGER} manager] getInstance`);
      SocketManager.instance = new SocketManager();
    }

    return SocketManager.instance;
  }

  public info(...messages: any) {
    mainLogger.tags(this._logPrefix).info(...messages);
  }

  public warn(...messages: any) {
    mainLogger.tags(this._logPrefix).warn(...messages);
  }

  public error(...messages: any) {
    mainLogger.tags(this._logPrefix).error(...messages);
  }

  public onPowerMonitorEvent(actionName: string) {
    this.info(
      `[PowerMonitor] Locked[${this._isScreenLocked}] ==> ${actionName}`,
    );

    if (!this._isScreenLocked && actionName === 'lock-screen') {
      this._isScreenLocked = true;
      this._onLockScreen();
    } else if (this._isScreenLocked && actionName === 'unlock-screen') {
      this._isScreenLocked = false;
      this._onUnlockScreen();
    }
  }

  public hasActiveFSM() {
    return this.activeFSM !== null;
  }

  public isScreenLocked() {
    return this._isScreenLocked;
  }

  public isOffline() {
    return this._isOffline;
  }

  public ongoingFSMCount() {
    let count = 0;

    if (this.activeFSM) {
      count += 1;
    }

    if (this._closingFSMs) {
      count += Object.keys(this._closingFSMs).length;
    }

    return count;
  }

  public isConnected() {
    return this.activeFSM && this.activeFSM.isConnected();
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
    this._hasLoggedIn = true;
    this._successConnectedUrls = [];
    this._stopActiveFSM();
    this._startFSM();
  }

  private _onLogout() {
    this.info('onLogout');
    this._hasLoggedIn = false;
    this._stopActiveFSM();
  }

  private _onServerHostUpdated() {
    const hasActive = this.hasActiveFSM();
    const serverUrl = this._getServerHost();
    // tslint:disable-next-line:max-line-length
    this.info(
      `onServerHostUpdated: ${serverUrl}, _hasLoggedIn: ${
        this._hasLoggedIn
      }, hasActiveFSM: ${hasActive}`,
    );
    if (!this._hasLoggedIn) {
      this.info('Ignore server updated event due to not logged-in');
      return;
    }
    // Ignore invalid url
    if (!serverUrl) {
      this.info('Server URL is changed, but it is an invalid URL.');
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
      const isNewUrl = this._successConnectedUrls.indexOf(serverUrl) === -1;
      if (!hasActive || isNewUrl) {
        // tslint:disable-next-line:max-line-length
        this.info(
          `Restart due to serverUrl update. hasActive: ${hasActive}, isNewUrl: ${isNewUrl}`,
        );
        this._stopActiveFSM();
        this._startFSM();
      } else if (!isNewUrl) {
        this.warn('Server URL is changed, but it is used before.');
      }
    }
  }

  private _onOffline() {
    this.info('onOffline');
    this._isOffline = true;
    this._stopActiveFSM();
  }

  private _onOnline() {
    this.info('onOnline');
    this._isOffline = false;
    if (!this._hasLoggedIn) {
      this.info('Not start socket when online due to not logged-in');
      return;
    }

    if (this._isScreenLocked) {
      this.info('Not start socket when online due to locked screen');
      return;
    }

    this._stopActiveFSM();
    this._startFSM();
  }

  private _onFocus() {
    if (!this.activeFSM) return;

    const state = this.activeFSM.state;
    if (state !== 'connected' && state !== 'connecting') {
      notificationCenter.emit(SERVICE.SOCKET_STATE_CHANGE, {
        state: 'refresh',
      });
    }
  }

  private _onLockScreen() {
    if (!this.activeFSM) {
      this.info('No activeFSM when lock screen.');
      return;
    }

    this.activeFSM.setReconnection(false);
  }

  private _onUnlockScreen() {
    if (this.isConnected()) {
      this.activeFSM.setReconnection(true);
      return;
    }

    if (this._hasLoggedIn && !this._isOffline) {
      this.info('Will renew socketFSM due to unlocking screen.');
      this._stopActiveFSM();
      this._startFSM();
      return;
    }

    this.info(
      `Not renew socketFSM: _hasLoggedIn[${this._hasLoggedIn}], _isOffline[${
        this._isOffline
      }]`,
    );
  }

  private _onReconnect(data: any) {
    // socket emit reconnect
    if (typeof data === 'number') return;

    try {
      const body = JSON.parse(data.body);
      const socketUserConfig = new SyncUserConfig();
      socketUserConfig.setSocketServerHost(body.server);
      notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST, body.server);
    } catch (error) {
      this.warn(`fail on socket reconnect: ${error}`);
    }
  }

  private _startFSM() {
    // TO-DO: 1. jitter 2. ignore for same serverURL when activeFSM is connected?
    const serverHost = this._getServerHost();
    const glipToken = AuthGlobalConfig.getGlipToken();
    if (serverHost) {
      this.activeFSM = new SocketFSM(
        serverHost,
        glipToken,
        this._stateHandler.bind(this),
      );

      if (this._isScreenLocked) {
        this.activeFSM.setReconnection(false);
      }

      this.activeFSM.start();
    }

    // TO-DO: should subscribe closed event to remove self from mananger?
  }

  private _stopActiveFSM() {
    if (this.activeFSM) {
      this.activeFSM.stop();
      // this._closingFSMs[this.activeFSM.name] = this.activeFSM;
      this.activeFSM = null;
    }
  }

  private _stateHandler(name: string, state: string) {
    if (state === 'connected') {
      const activeState = this.activeFSM && this.activeFSM.state;
      if (state === activeState) {
        const activeUrl = this.activeFSM.serverUrl;
        if (this._successConnectedUrls.indexOf(activeUrl) === -1) {
          this._successConnectedUrls.push(activeUrl);
        }
      } else {
        this.warn(`Invalid activeState: ${activeState}`);
      }
    }

    notificationCenter.emit(SERVICE.SOCKET_STATE_CHANGE, {
      state,
    });
  }

  private _getServerHost() {
    const socketUserConfig = new SyncUserConfig();
    return socketUserConfig.getSocketServerHost();
  }
}
