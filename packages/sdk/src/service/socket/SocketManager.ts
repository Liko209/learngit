/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 16:59:44
 * Copyright © RingCentral. All rights reserved.
 */
import { SocketFSM } from './SocketFSM';
import notificationCenter from '../../service/notificationCenter';
import { CONFIG, SOCKET, SERVICE } from '../../service/eventKey';
import { mainLogger } from 'foundation';
import { AuthUserConfig } from '../../service/auth/config';
import { SocketCanConnectController } from './SocketCanConnectController';
import { getCurrentTime } from '../../utils/jsUtils';
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
  private _isFirstInit: boolean = true;
  private _currentId: number = 0;
  private _canReconnectController: SocketCanConnectController | undefined;

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
    const synConfig = new SyncUserConfig();
    const timeStamp = synConfig.getLastIndexTimestamp();
    this.info('onLogin', timeStamp);
    if (!timeStamp) {
      return;
    }
    this._hasLoggedIn = true;
    this._successConnectedUrls = [];
    this._restartFSM();
  }

  private _onLogout() {
    this.info('onLogout');
    this._hasLoggedIn = false;
    this._stopActiveFSM();
    this._successConnectedUrls = [];
  }

  private _onServerHostUpdated() {
    const serverUrl = this._getServerHost();
    const shouldReStart = this._shouldRestartFSMWithNewHost(serverUrl);
    if (shouldReStart) {
      /* To avoid run into death loop in such case:
          scoreboard from /index is different to which from socket reconnect event.
          Solution:
          Save the URL which is connected success, ignore reseting to these tried URLs
      */
      this._restartFSM();
    }
  }

  private _shouldRestartFSMWithNewHost(serverUrl: string) {
    const hasActive = this.hasActiveFSM();
    // tslint:disable-next-line:max-line-length
    this.info(
      `onServerHostUpdated: ${serverUrl}, _hasLoggedIn: ${
        this._hasLoggedIn
      }, hasActiveFSM: ${hasActive}`,
    );
    const isValid = this._isValidStatusAndUrl(serverUrl);
    return isValid && this._newUrlOrHasNotActiveFSM(serverUrl);
  }

  private _isValidStatusAndUrl(serverUrl: string) {
    if (!this._hasLoggedIn) {
      this.info('Ignore server updated event due to not logged-in');
      return false;
    }
    // Ignore invalid url
    if (!serverUrl) {
      this.info('Server URL is changed, but it is an invalid URL.');
      return false;
    }
    const runningUrl = this.activeFSM && this.activeFSM.serverUrl;
    this.info(`serverUrl changed: ${runningUrl} ==> ${serverUrl}`);
    return runningUrl !== serverUrl;
  }

  private _newUrlOrHasNotActiveFSM(serverUrl: string) {
    const hasActive = this.hasActiveFSM();
    const isNewUrl = !this._successConnectedUrls.includes(serverUrl);
    this.info(
      `enter _newUrlOrHasNotActiveFSM: ${hasActive}, isNewUrl: ${isNewUrl}`,
    );
    if (!isNewUrl) {
      this.warn('Server URL is changed, but it is used before.');
    }

    return !hasActive || isNewUrl;
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

    this._restartFSM();
  }

  private _onFocus() {
    // reset to empty when focused
    this._successConnectedUrls = [];

    if (!this.activeFSM) return;

    this.activeFSM.doGlipPing();

    const state = this.activeFSM.state;
    // TODO check with others, we may not need refresh
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
  }

  private _onUnlockScreen() {
    if (this.isConnected()) {
      return;
    }
    this.info(
      `Not renew socketFSM: _hasLoggedIn[${this._hasLoggedIn}], _isOffline[${
        this._isOffline
      }]`,
    );
    if (this._hasLoggedIn && !this._isOffline) {
      this.info('Will renew socketFSM due to unlocking screen.');
      this._restartFSM();
      return;
    }
  }

  private _onReconnect(data: any) {
    // socket emit reconnect
    if (typeof data === 'number') return;

    try {
      const body = JSON.parse(data.body);
      const socketUserConfig = new SyncUserConfig();
      socketUserConfig.setSocketServerHost(body.server);

      const shouldReStart = this._shouldRestartFSMWithNewHost(body.server);
      if (shouldReStart) {
        // in this case, it does not need to check weather it can connect to server or not
        this._stopActiveFSM();
        this._startRealFSM();
      }
    } catch (error) {
      this.warn(`fail on socket reconnect: ${error}`);
    }
  }

  private _startFSM() {
    this.info('_startFSM');

    if (!this._canReconnectController) {
      this._currentId = getCurrentTime();
      this._canReconnectController = new SocketCanConnectController(
        this._currentId,
      );
      this._canReconnectController.doCanConnectApi(
        this._canConnectCallback.bind(this),
        this._isFirstInit,
      );
    } else {
      this.warn('this._canReconnectController should be null');
    }
  }

  private _canConnectCallback(id: number) {
    this.info(
      `_startFSM can reconnect callback _startRealFSM id:${id} this._currentId:${
        this._currentId
      }`,
    );
    if (id === this._currentId) {
      this._startRealFSM();
    }
    this._isFirstInit = false;
    this._canReconnectController && this._canReconnectController.cleanup();
  }

  private _startRealFSM() {
    // TO-DO: 1. jitter 2. ignore for same serverURL when activeFSM is connected?
    const serverHost = this._getServerHost();
    const authConfig = new AuthUserConfig();
    const glipToken = authConfig.getGlipToken();
    if (serverHost) {
      this.activeFSM = new SocketFSM(
        serverHost,
        glipToken,
        this._stateHandler.bind(this),
        this._glipPingPongStatusCallback.bind(this),
      );
      this.activeFSM.start();
    }
  }

  private _stopActiveFSM() {
    notificationCenter.emitKVChange(SERVICE.STOPPING_SOCKET);
    if (this.activeFSM) {
      this.activeFSM.stop();
      this.activeFSM = null;
    }
    if (this._canReconnectController) {
      this._canReconnectController.cleanup();
      this._canReconnectController = undefined;
    }

    this._currentId = 0;
  }

  private _stateHandler(name: string, state: string) {
    this.info('_stateHandler state:', state);
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
    } else if (state === 'disconnected') {
      this._restartFSM();
    }

    notificationCenter.emit(SERVICE.SOCKET_STATE_CHANGE, {
      state,
    });
  }

  private _glipPingPongStatusCallback(isSuccess: boolean) {
    this.info(' _glipPingPongStatusCallback isSuccess', isSuccess);
    if (!isSuccess) {
      this._restartFSM();
    }
  }

  private _restartFSM() {
    this.info('restartFSM ', this._isScreenLocked);
    if (!this._isScreenLocked) {
      this._stopActiveFSM();
      this._startFSM();
    }
  }

  private _getServerHost() {
    const socketUserConfig = new SyncUserConfig();
    return socketUserConfig.getSocketServerHost();
  }
}
