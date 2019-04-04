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
import _ from 'lodash';

export class LogControlManager implements IAccessor {
  private static _instance: LogControlManager;
  private _isOnline: boolean;
  private _onUploadAccessorChange: (accessible: boolean) => void;
  private _tagBlackList: string[] = [];
  private _tagWhiteList: string[] = [];
  uploadLogConsumer: LogUploadConsumer;
  memoryLogConsumer: MemoryLogConsumer;
  private constructor() {
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
      return this._whiteListFilter(log) || !this._blackListFilter(log);
    });
    logManager.addConsumer(this.memoryLogConsumer);
    logManager.addConsumer(this.uploadLogConsumer);
    this.subscribeNotifications();
  }

  private _whiteListFilter = (log: LogEntity) => {
    return _.intersection(this._tagWhiteList, log.tags).length > 0;
  }

  private _blackListFilter = (log: LogEntity) => {
    return _.intersection(this._tagBlackList, log.tags).length > 0;
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
    const permissionService: PermissionService = PermissionService.getInstance();
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

  windowError(msg: string, url: string, line: number) {
    const message = `Error in ('${url ||
      window.location}) on line ${line} with message (${msg})`;
    mainLogger.fatal(message);
    this.flush();
  }

  addTag2BlackList(...tags: string[]) {
    this._tagBlackList = _.uniq([...this._tagBlackList, ...tags]);
  }

  removeFromBlackList(...tags: string[]) {
    this._tagBlackList = _.difference(tags, this._tagBlackList);
  }

  addTag2WhiteList(...tags: string[]) {
    this._tagWhiteList = _.uniq([...this._tagWhiteList, ...tags]);
  }

  removeFromWhiteList(...tags: string[]) {
    this._tagWhiteList = _.difference(tags, this._tagWhiteList);
  }
}
