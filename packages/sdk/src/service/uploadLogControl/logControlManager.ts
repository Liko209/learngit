/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 11:05:46
 */
import notificationCenter from '../notificationCenter';
import { SERVICE, WINDOW } from '../../service/eventKey';
import { logManager, LOG_LEVEL, mainLogger } from 'foundation';
import LogUploadManager from './logUploadManager';
import AccountService, { UserConfig } from '../account';

const DEFAULT_EMAIL = 'service@glip.com';

notificationCenter.on(WINDOW.ONLINE, ({ onLine }) => {
  LogControlManager.instance().setNetworkState(onLine);
});

notificationCenter.on(SERVICE.LOGOUT, () => {
  LogControlManager.instance().doUpload();
});

notificationCenter.on(WINDOW.BLUR, () => {
  LogControlManager.instance().doUpload();
});

class LogControlManager {
  private static _instance: LogControlManager;
  private _enabledLog: boolean;
  private _isDebugMode: boolean; // if in debug mode, should not upload log
  private _isUploading: boolean;
  private _isOnline: boolean;
  private constructor() {
    this._isUploading = false;
    this._enabledLog = true;
    this._isDebugMode = true;
    this._isOnline = true;
    logManager.setOverThresholdCallback(() => {
      this.doUpload();
    });
  }

  public static instance(): LogControlManager {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new LogControlManager();
    return this._instance;
  }

  public setDebugMode(isDebug: boolean) {
    this._isDebugMode = isDebug;
    this._updateLogSystemLevel();
  }

  public enableLog(enable: boolean) {
    this._enabledLog = enable;
    this._updateLogSystemLevel();
  }

  public async flush() {
    this.doUpload();
  }

  public setNetworkState(isOnline: boolean) {
    this._isOnline = isOnline;
  }

  public async doUpload() {
    if (!this._isOnline || this._isUploading || this._isDebugMode) {
      return;
    }

    const logs = await logManager.getLogs();
    if (this.logIsEmpty(logs)) {
      return;
    }
    this._isUploading = true;
    const userInfo = await this._getUserInfo();
    try {
      await LogUploadManager.instance().doUpload(userInfo, logs);
    } catch (err) {
      mainLogger.error(`doUpload: ${JSON.stringify(err)}`);
    } finally {
      logManager.clearLogs();
      this._isUploading = false;
    }
  }

  logIsEmpty(logs: any): boolean {
    if (logs) {
      const keys = Object.keys(logs);
      for (let i = 0; i < keys.length; i += 1) {
        if (Array.isArray(logs[keys[i]]) && logs[keys[i]].length !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  private async _getUserInfo() {
    const accountService: AccountService = AccountService.getInstance();
    const email = (await accountService.getUserEmail()) || DEFAULT_EMAIL;
    const id = UserConfig.getCurrentUserId();
    const userId = id ? id.toString() : '';
    const clientId = accountService.getClientId();
    return {
      email,
      userId,
      clientId,
    };
  }

  private _updateLogSystemLevel() {
    // set log level to log system
    // TODO let it all level now, should reset to above code after implement service framework
    mainLogger.info(
      `_isDebugMode : ${this._isDebugMode} _enabledLog: ${this._enabledLog}`,
    );
    const level: LOG_LEVEL = LOG_LEVEL.ALL;
    logManager.setAllLoggerLevel(level);
  }
}

export default LogControlManager;
