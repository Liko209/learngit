/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 11:05:46
 */
import { LogEntity, logManager, LOG_LEVEL, mainLogger } from 'foundation';
import { PermissionService, UserPermissionType } from '../../module/permission';
import { ENTITY, SERVICE, WINDOW } from '../../service/eventKey';
import notificationCenter from '../notificationCenter';
import {
  configManager as logUploadConsumerConfigManager,
  IAccessor,
  LogPersistent,
  LogUploadConsumer,
  MemoryLogConsumer,
} from './consumer';
import { LogUploader } from './LogUploader';
import JSZip from 'jszip';
import * as filestack from 'filestack-js';
import { progressBar } from '../../utils/progress';
const FILE_STACK_API_KEY = 'AMQqm7fiSTkC6TGrB15Yhz';

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
      new LogPersistent(),
      this,
    );
    this.memoryLogConsumer = new MemoryLogConsumer();
    this.memoryLogConsumer.setSizeThreshold(10 * 1024 * 1024);
    this.memoryLogConsumer.setFilter((log: LogEntity) => {
      return !log.tags.includes('ImageDownloader');
    });
    logManager.setConsumer(this.uploadLogConsumer);
    logManager.setConsumer(this.memoryLogConsumer);

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
      logUploadConsumerConfigManager.mergeConfig({
        uploadEnabled: logUploadEnabled,
      });
    } catch (error) {
      mainLogger.warn('getUserPermission fail:', error);
    }
  }

  getMemoryLogs(): LogEntity[] {
    return this.memoryLogConsumer.getRecentLogs();
  }

  async uploadMemoryLogs(): Promise<{
    filename: string;
    handle: string;
    size: number;
    url: string;
  } | null> {
    const recentLogs = this.memoryLogConsumer.getRecentLogs();
    if (recentLogs.length < 1) {
      console.debug('Recent logs is empty');
      return null;
    }
    const client = filestack.init(FILE_STACK_API_KEY);
    const zip = new JSZip();
    zip.file(
      'recentLogs.txt',
      this.memoryLogConsumer
        .getRecentLogs()
        .map((log: LogEntity, index: number) => {
          return `${index}: ${log.message}`;
        })
        .join('\n'),
    );
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    console.log('zip file done.');
    progressBar.start();
    const uploadResult = await client.upload(
      zipBlob,
      {
        onProgress: (evt: { totalPercent: number; totalBytes: number }) => {
          console.log(evt.totalPercent);
        },
        timeout: 60 * 1000,
        retry: 1,
      },
      {
        filename: `LOG_${recentLogs[0].sessionId}.zip`,
      },
    );
    progressBar.stop();
    console.log('uploadResult,', uploadResult);
    return uploadResult;
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
