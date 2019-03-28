/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 11:05:46
 */
import { LogEntity, logManager, LOG_LEVEL, mainLogger } from 'foundation';
import { PermissionService, UserPermissionType } from '../../module/permission';
import { ENTITY, SERVICE, WINDOW } from '../../service/eventKey';
import notificationCenter from '../notificationCenter';
import {
  LogMemoryPersistent,
  IAccessor,
  configManager as logConsumerConfigManager,
  LogUploadConsumer,
  MemoryLogConsumer,
} from './consumer';
import { LogUploader } from './LogUploader';

export class LogControlManager implements IAccessor {
  private static _instance: LogControlManager;
  private _isOnline: boolean;
  private _enabledLog: boolean;
  private _isDebugMode: boolean; // if in debug mode, should not upload log
  private _onUploadAccessorChange: (accessible: boolean) => void;
  uploadLogConsumer: LogUploadConsumer;
  memoryLogConsumer: MemoryLogConsumer;
  private constructor() {
    this._enabledLog = true;
    this._isDebugMode = true;
    this._isOnline = window.navigator.onLine;
    this.uploadLogConsumer = new LogUploadConsumer(
      new LogUploader(),
      new LogMemoryPersistent(
        logConsumerConfigManager.getConfig().persistentLimit,
      ),
      this,
    );
    this.memoryLogConsumer = new MemoryLogConsumer();
    this.memoryLogConsumer.setSizeThreshold(
      logConsumerConfigManager.getConfig().memoryCacheSizeThreshold,
    );
    this.memoryLogConsumer.setFilter((log: LogEntity) => {
      return !log.tags.includes('ImageDownloader');
    });
    logManager.addConsumer(this.memoryLogConsumer);
    logManager.addConsumer(this.uploadLogConsumer);
    this.subscribeNotifications();
  }

  public static instance(): LogControlManager {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new LogControlManager();
    return this._instance;
  }

  subscribeNotifications() {
    notificationCenter.on(ENTITY.USER_PERMISSION, () => {
      this.configByPermission();
    });

    notificationCenter.on(WINDOW.ONLINE, ({ onLine }) => {
      this.setNetworkState(onLine);
    });

    notificationCenter.on(SERVICE.LOGOUT, () => {
      this.flush();
    });

    notificationCenter.on(WINDOW.BLUR, () => {
      this.flush();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.windowError.bind(this));
      window.addEventListener('beforeunload', (event: any) => {
        this.flush();
      });
    }
  }

  public setDebugMode(isDebug: boolean) {
    this._isDebugMode = isDebug;
    this._updateLogSystemLevel();
  }

  public async flush() {
    this.uploadLogConsumer.flush();
  }

  public setNetworkState(isOnline: boolean) {
    this._isOnline !== isOnline &&
      this._onUploadAccessorChange &&
      this._onUploadAccessorChange(isOnline);
    this._isOnline = isOnline;
  }

  isAccessible(): boolean {
    return this._isOnline && window.navigator.onLine;
  }

  subscribe(onChange: (accessible: boolean) => void): void {
    this._onUploadAccessorChange = onChange;
  }

  async configByPermission() {
    const permissionService: PermissionService = PermissionService.getInstance();
    try {
      const logEnabled = await permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_SAVE_LOG,
      );
      const logUploadEnabled = await permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_UPLOAD_LOG,
      );
      logManager.config({
        browser: {
          enabled: logEnabled,
        },
      });
      logConsumerConfigManager.mergeConfig({
        uploadEnabled: logUploadEnabled,
      });
    } catch (error) {
      mainLogger.warn('getUserPermission fail:', error);
    }
  }

  getRecentLogs(): LogEntity[] {
    return this.memoryLogConsumer.getRecentLogs();
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

  windowError(msg: string, url: string, line: number) {
    const message = `Error in ('${url ||
      window.location}) on line ${line} with message (${msg})`;
    mainLogger.fatal(message);
    this.flush();
  }
}
