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
  ConsumerCollector,
  MemoryCollector,
  FixSizeMemoryLogCollection,
} from './collectors';
import _ from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { IZipItemProvider } from './types';
import JSZip from 'jszip';
import { ZipLogZipItemProvider } from './ZipLogZipItemProvider';
import { MemoryLogZipItemProvider } from './MemoryLogZipItemProvider';

export class LogControlManager implements IAccessor {
  private static _instance: LogControlManager;
  private _isOnline: boolean;
  private _debugMode: boolean;
  private _onUploadAccessorChange: (accessible: boolean) => void;
  private _zipItemProviders: IZipItemProvider[] = [];
  uploadLogConsumer: LogUploadConsumer;
  logUploadCollector: ConsumerCollector;
  memoryLogCollector: MemoryCollector;
  private constructor() {
    this._isOnline = window.navigator.onLine;
    const zipLogProvider = new ZipLogZipItemProvider();
    this.memoryLogCollector = new MemoryCollector(zipLogProvider);
    this.logUploadCollector = new ConsumerCollector(
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
    this.registerZipProvider(zipLogProvider);
    this.registerZipProvider(
      new MemoryLogZipItemProvider(this.memoryLogCollector),
    );
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
      window.addEventListener(
        'unhandledrejection',
        this.windowError.bind(this),
      );
      window.addEventListener('beforeunload', (event: any) => {
        this.flush();
      });
    }
  }

  public setDebugMode(isDebug: boolean) {
    this._debugMode = isDebug;
    if (isDebug) {
      logManager.config({
        browser: {
          enabled: true,
        },
      });
      logManager.setAllLoggerLevel(LOG_LEVEL.ALL);
      configManager.mergeConfig({
        uploadEnabled: false,
      });
    }
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
          enabled: this._debugMode || logEnabled,
        },
      });
      configManager.mergeConfig({
        uploadEnabled: !this._debugMode && logUploadEnabled,
      });
    } catch (error) {
      mainLogger.warn('getUserPermission fail:', error);
    }
  }

  getRecentLogs(): LogEntity[] {
    return this.memoryLogCollector.getAll();
  }

  windowError(event: ErrorEvent | PromiseRejectionEvent) {
    if (event instanceof ErrorEvent) {
      const { error, message } = event;
      mainLogger.fatal(message, error);
    } else {
      const { reason, promise } = event;
      mainLogger.fatal(reason, promise);
    }
    this.flush();
  }

  registerZipProvider(ins: IZipItemProvider) {
    this._zipItemProviders.push(ins);
  }

  getZipLog = async () => {
    const result = await Promise.all(
      this._zipItemProviders.map(provider => {
        return provider.getZipItems();
      }),
    );
    const zip = new JSZip();
    const nameMap = new Map<string, number>();
    result.forEach(it => {
      it.forEach(zipItem => {
        if (nameMap.has(zipItem.name)) {
          nameMap.set(zipItem.name, nameMap.get(zipItem.name)! + 1);
          const fileName = `${zipItem.name}-${nameMap.get(zipItem.name)! + 1}${
            zipItem.type
          }`;
          zipItem.folder
            ? zip.folder(zipItem.folder).file(fileName, zipItem.content)
            : zip.file(fileName, zipItem.content);
        } else {
          nameMap.set(zipItem.name, 1);
          const fileName = `${zipItem.name}${zipItem.type}`;
          zipItem.folder
            ? zip.folder(zipItem.folder).file(fileName, zipItem.content)
            : zip.file(fileName, zipItem.content);
        }
      });
    });
    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
  }
}
