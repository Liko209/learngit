/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 11:05:46
 */
import { LogEntity, logManager, LOG_LEVEL, mainLogger } from 'foundation';
import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { ENTITY, SERVICE, WINDOW, DOCUMENT } from 'sdk/service/eventKey';
import notificationCenter from 'sdk/service/notificationCenter';
import { LogMemoryPersistent, LogUploadConsumer, IAccessor } from './consumer';
import { configManager } from './config';
import { LogUploader } from './LogUploader';
import {
  LogCollector,
  LogMemoryCollector,
  FixSizeMemoryLogCollection,
} from './collectors';
import _ from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

export class LogControlManager implements IAccessor {
  private static _instance: LogControlManager;
  private _isOnline: boolean;
  private _onUploadAccessorChange: (accessible: boolean) => void;
  uploadLogConsumer: LogUploadConsumer;
  logUploadCollector: LogCollector;
  memoryLogCollector: LogMemoryCollector;
  private constructor() {
    this._isOnline = window.navigator.onLine;
    this.memoryLogCollector = new LogMemoryCollector();
    this.logUploadCollector = new LogCollector(
      new FixSizeMemoryLogCollection(
        configManager.getConfig().memoryCacheSizeThreshold,
      ),
    );
    this.uploadLogConsumer = new LogUploadConsumer(
      this.logUploadCollector,
      new LogUploader(),
      new LogMemoryPersistent(configManager.getConfig().persistentLimit),
      this,
    );
    this.logUploadCollector.setConsumer(this.uploadLogConsumer);
    logManager.addCollector(this.logUploadCollector);
    logManager.addCollector(this.memoryLogCollector);
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

    notificationCenter.on(DOCUMENT.VISIBILITYCHANGE, ({ isHidden }) => {
      isHidden && this.flush();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.windowError.bind(this));
      window.addEventListener('beforeunload', (event: any) => {
        this.flush();
      });
    }
  }

  public setDebugMode(isDebug: boolean) {
    isDebug && logManager.setAllLoggerLevel(LOG_LEVEL.ALL);
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
    const permissionService = ServiceLoader.getInstance<PermissionService>(
      ServiceConfig.PERMISSION_SERVICE,
    );
    try {
      const logEnabled = await permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_SAVE_LOG, // flag for console log
      );
      const logUploadEnabled = await permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_UPLOAD_LOG,
      );
      logManager.config({
        browser: {
          enabled: logEnabled,
        },
      });
      configManager.mergeConfig({
        uploadEnabled: logUploadEnabled,
      });
    } catch (error) {
      mainLogger.warn('getUserPermission fail:', error);
    }
  }

  getRecentLogs(): LogEntity[] {
    return this.memoryLogCollector.getAll();
  }

  windowError(msg: string, url: string, line: number) {
    const message = `Error in ('${url ||
      window.location}) on line ${line} with message (${msg})`;
    mainLogger.fatal(message);
    this.flush();
  }
}
