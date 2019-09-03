/*
 * @Author: steven.zhuang
 * @Date: 2018-06-22 16:59:44
 * Copyright © RingCentral. All rights reserved.
 */
import { SocketFSM, StateHandlerType } from './SocketFSM';
import notificationCenter from '../notificationCenter';
import { CONFIG, SOCKET, SERVICE } from '../eventKey';
import { mainLogger } from 'foundation/log';
import { HealthModuleManager, BaseHealthModule } from 'foundation/health';
import { powerMonitor } from 'foundation/utils';
import { AccountService } from 'sdk/module/account/service';
import { SocketCanConnectController } from './SocketCanConnectController';
import { getCurrentTime } from 'sdk/utils/jsUtils';
import { SyncService } from 'sdk/module/sync/service';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { MODULE_IDENTIFY, MODULE_NAME } from './constants';
import { LoginInfo } from 'sdk/types';

const SOCKET_LOGGER = 'SOCKET';
export class SocketManager {
  private static instance: SocketManager;
  public activeFSM: any = null;

  private _logPrefix: string;
  private _closingFSMs: { [key: string]: SocketFSM } = {};
  private _successConnectedUrls: string[] = [];
  private _hasLoggedIn: boolean = false;
  private _isOffline: boolean = false;
  private _isFirstInit: boolean = true;
  private _currentId: number = 0;
  private _canReconnectController: SocketCanConnectController | undefined;
  private _reconnectRetryCount: number = 0;

  private constructor() {
    this._logPrefix = `[${SOCKET_LOGGER} manager]`;

    this._subscribeExternalEvent();
    HealthModuleManager.getInstance().register(
      new BaseHealthModule(MODULE_IDENTIFY, MODULE_NAME),
    );

    HealthModuleManager.getInstance()
      .get(MODULE_IDENTIFY)!
      .register({
        name: 'SocketConnectState',
        getStatus: () => ({
          state: this.activeFSM ? this.activeFSM.state : 'none',
        }),
      });

    powerMonitor.onLock(this._onLockScreen);
    powerMonitor.onUnlock(this._onUnlockScreen);
  }

  public cleanup() {
    powerMonitor.offLock(this._onLockScreen);
    powerMonitor.offUnlock(this._onUnlockScreen);
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

  public hasActiveFSM() {
    return this.activeFSM !== null;
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
    notificationCenter.on(SERVICE.GLIP_LOGIN, (loginInfo: LoginInfo) => {
      loginInfo.success && this._onLogin();
    });

    notificationCenter.on(SERVICE.LOGOUT, () => {
      this._onLogout();
    });

    notificationCenter.on(
      CONFIG.INDEX_SOCKET_SERVER_HOST,
      (scoreboard: string) => {
        this._onIndexSocketServerHostUpdated(scoreboard);
      },
    );

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
    notificationCenter.on(SOCKET.ERROR, () => {
      this._onSocketError('socket error');
    });
    notificationCenter.on(SOCKET.CONNECT_ERROR, () => {
      this._onSocketError('socket connect error');
    });
  }

  private _onSocketError(errMsg: string) {
    this._reconnectRetryCount = this._reconnectRetryCount + 1;
    this.error(
      `${errMsg}, clearing socket address$ and re do index, nth:${
      this._reconnectRetryCount
      }`,
    );
  }

  private _onLogin() {
    const synConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
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

  private _onIndexSocketServerHostUpdated(serverUrl: string) {
    const shouldReStart = this._isValidStatusAndUrl(serverUrl);
    if (shouldReStart) {
      /* To avoid run into death loop in such case:
          scoreboard from /index is different to which from socket reconnect event.
          Solution:
          1. try use socket host got from 'reconnect' event first
          2. if gets a new index-socket-host, should do nothing when socket is connected.
          3. clear reconnect-socket-host if use it connects to server fail
          4. if there is not reconnect-socket-host, use index-socket-host
      */
      this._restartFSM();
    }
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
    const isConnected = this.isConnected();
    this.info(
      `serverUrl changed isConnected: ${isConnected} serverUrl:${serverUrl}`,
    );
    return !isConnected;
  }

  private _onReconnectSocketServerHostUpdated(serverUrl: string) {
    const runningUrl = this._getRunningFSMUrl();
    this.info(
      `incomes new reconnect socket host:${serverUrl}, and current running url ${runningUrl}`,
    );
    if (!serverUrl) {
      return;
    }
    const socketUserConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    socketUserConfig.setReconnectSocketServerHost(serverUrl);
    if (serverUrl === runningUrl) {
      return;
    }
    this._stopActiveFSM();
    this._startRealFSM();
  }

  private _getRunningFSMUrl() {
    return (this.activeFSM && this.activeFSM.serverUrl) || '';
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

    if (powerMonitor.isScreenLocked()) {
      this.info('Not start socket when online due to locked screen');
      return;
    }

    // reset to default state
    this._reconnectRetryCount = 0;
    if (this._canReconnectController) {
      this._canReconnectController.cleanup();
    }

    this._restartFSM();
  }

  private _onFocus() {
    if (!this._hasLoggedIn) {
      return;
    }

    // reset to empty when focused
    this._successConnectedUrls = [];

    if (!this.activeFSM) {
      this.info('focused and has not active FSM, try to restart one');
      this._restartFSM();
      return;
    }
    this.activeFSM.doGlipPing();

    const state = this.activeFSM.state;
    // TODO check with others, we may not need refresh
    if (state !== 'connected' && state !== 'connecting') {
      notificationCenter.emit(SERVICE.SOCKET_STATE_CHANGE, {
        state: 'refresh',
      });
    }
  }

  private _onLockScreen = () => {
    if (!this.activeFSM) {
      this.info('No activeFSM when lock screen.');
    }
  };

  private _onUnlockScreen = () => {
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
    }
  };

  private _onReconnect(data: any) {
    // socket emit reconnect
    if (typeof data === 'number') return;

    try {
      const body = JSON.parse(data.body);
      this._onReconnectSocketServerHostUpdated(body.server);
    } catch (error) {
      this.warn(`fail on socket reconnect: ${error}`);
    }
  }

  private _startFSM() {
    this.info('_startFSM');

    if (!this._canReconnectController) {
      this._currentId = getCurrentTime();
      const socketUserConfig = ServiceLoader.getInstance<SyncService>(
        ServiceConfig.SYNC_SERVICE,
      ).userConfig;
      const lastTime = socketUserConfig.getLastCanReconnectTime() || 0;
      socketUserConfig.setLastCanReconnectTime(this._currentId);
      this._canReconnectController = new SocketCanConnectController(
        this._currentId,
      );
      this._canReconnectController.doCanConnectApi({
        interval: this._currentId - lastTime,
        callback: this._canConnectCallback.bind(this),
        forceOnline: this._isFirstInit,
        nthCount: this._reconnectRetryCount,
      });
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
    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    const glipToken = authConfig.getGlipToken();
    this.info('starting FSM with host:', serverHost);
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
      this._stateHandler({
        name: this.activeFSM.name,
        state: 'disconnected',
        isManualStopped: true,
      });
      this._clearReconnectSocketHost();
      this.activeFSM.stopFSM();
      this.activeFSM = null;
    }
    if (this._canReconnectController) {
      this._canReconnectController.cleanup();
      delete this._canReconnectController;
      this._canReconnectController = undefined;
    }

    this._currentId = 0;
  }

  private _clearReconnectSocketHost() {
    this.info('start clearing reconnect socket address');
    const runningUrl = this._getRunningFSMUrl();
    const socketUserConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    if (runningUrl === socketUserConfig.getReconnectSocketServerHost()) {
      this.info('clearing reconnect socket address', runningUrl);
      socketUserConfig.setReconnectSocketServerHost('');
    }
  }

  private _stateHandler({ name, state, isManualStopped }: StateHandlerType) {
    this.info(
      `stateHandler name:${name}, state:${state}, isManualStopped:${isManualStopped}`,
    );

    if (state === 'connected') {
      this._reconnectRetryCount = 0;
      const activeState = this.activeFSM && this.activeFSM.state;
      if (state === activeState) {
        const activeUrl = this.activeFSM.serverUrl;
        if (this._successConnectedUrls.indexOf(activeUrl) === -1) {
          this._successConnectedUrls.push(activeUrl);
        }
      } else {
        this.warn(`Invalid activeState: ${activeState}`);
      }
    } else if (state === 'disconnected' && !isManualStopped) {
      // should restart FSM when is not stopped by manual
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

  private _isDoingCanConnect() {
    return (
      this._canReconnectController &&
      this._canReconnectController.isDoingCanConnect()
    );
  }

  private _restartFSM() {
    const isScreenLocked = powerMonitor.isScreenLocked();
    if (isScreenLocked || this._isDoingCanConnect()) {
      this.info(
        'should not restartFSM isScreenLocked:',
        isScreenLocked,
        ', _isDoingCanConnect:',
        this._isDoingCanConnect(),
      );
      return;
    }

    this._stopActiveFSM();
    this._startFSM();
  }

  private _getServerHost() {
    const socketUserConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    const reconnectAddress = socketUserConfig.getReconnectSocketServerHost();
    return reconnectAddress || socketUserConfig.getIndexSocketServerHost();
  }
}
