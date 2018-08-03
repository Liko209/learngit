/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 11:05:46
 */
import notificationCenter from '../notificationCenter';
import { DOCUMENT } from '../../service/eventKey';
import { logManager, LOG_LEVEL, mainLogger } from 'foundation';
import LogUploadManager from './logUploadManager';
import AccountService from '../account';

const DEFAULT_EMAIL = 'service@glip.com';
notificationCenter.on(DOCUMENT.VISIBILITYCHANGE, ({ isHidden }) => {
  if (isHidden) {
    LogControlManager.Instance().doUpload();
  }
});
class LogControlManager {
  private static _instance: LogControlManager;
  private _enabledLog: boolean;
  private _isDebugMode: boolean; // if in debug mode, should not upload log
  private _isUploading: boolean;
  private constructor() {
    this._isUploading = false;
    this._enabledLog = true;
    this._isDebugMode = true;
  }

  public static Instance(): LogControlManager {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new LogControlManager();
    return this._instance;
  }

  public setDebugMode(isDebug: boolean) {
    this._isDebugMode = isDebug;
    this.updateLogSystemLevel();
  }

  public enableLog(enable: boolean) {
    this._enabledLog = enable;
    this.updateLogSystemLevel();
  }

  public async flush() {
    this.doUpload();
  }

  public async doUpload() {
    if (this._isUploading) {
      return;
    }
    if (this._isDebugMode) {
      // should not doupload in debug mode
      return;
    }

    const logs = await logManager.getLogs();
    if (this.logIsEmpty(logs)) {
      return;
    }
    this._isUploading = true;
    const userInfo = await this.getUserInfo();
    try {
      await LogUploadManager.Instance().doUpload(userInfo, logs);
    } catch (err) {
      mainLogger.error(err);
    } finally {
      logManager.clearLogs();
      this._isUploading = false;
    }
  }

  logIsEmpty(logs: any): boolean {
    if (logs) {
      const keys = Object.keys(logs);
      for (let i = 0; i < keys.length; i++) {
        if (Array.isArray(logs[keys[i]]) && logs[keys[i]].length !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  private async getUserInfo() {
    const accountService: AccountService = AccountService.getInstance();
    const email = (await accountService.getUserEmail()) || DEFAULT_EMAIL;
    const id = accountService.getCurrentUserId();
    const userId = id ? id.toString() : '';
    const clientId = accountService.getClientId();
    return {
      email,
      userId,
      clientId,
    };
  }

  private updateLogSystemLevel() {
    // set log level to log system
    // const level: LOG_LEVEL = this._isDebugMode || this._enabledLog ? LOG_LEVEL.ALL : LOG_LEVEL.WARN;
    // TODO let it all level now, should reset to above code after implement service framework
    mainLogger.info(`_isDebugMode : ${this._isDebugMode} _enabledLog: ${this._enabledLog}`);
    const level: LOG_LEVEL = LOG_LEVEL.ALL;
    logManager.setAllLoggerLevel(level);
  }
}

export default LogControlManager;
