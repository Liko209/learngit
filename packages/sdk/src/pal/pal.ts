/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-28 18:19:57
 * Copyright © RingCentral. All rights reserved.
 */

import { IImageDownloader } from './downloader';
import { IErrorReporter } from './errorReporter';
import { IApplicationInfo } from './applicationInfo';
import { INotificationPermission } from './notificationPermission';
import { IWhiteScreenChecker } from './whiteScreenChecker';

class Pal {
  private static _sPalInstance: Pal;
  private _imageDownloader: IImageDownloader;
  private _errorReporter: IErrorReporter;
  private _applicationInfo: IApplicationInfo;
  private _notificationPermission: INotificationPermission;
  private _whiteScreenChecker: IWhiteScreenChecker;

  static get instance(): Pal {
    if (!this._sPalInstance) {
      this._sPalInstance = new Pal();
    }
    return this._sPalInstance;
  }

  setImageDownloader(imageDownloader: IImageDownloader) {
    this._imageDownloader = imageDownloader;
  }

  getImageDownloader(): IImageDownloader {
    return this._imageDownloader;
  }

  setErrorReporter(errorReporter: IErrorReporter) {
    this._errorReporter = errorReporter;
  }

  getErrorReporter(): IErrorReporter {
    return this._errorReporter;
  }

  setApplicationInfo(applicationInfo: IApplicationInfo) {
    this._applicationInfo = applicationInfo;
  }

  getApplicationInfo(): IApplicationInfo {
    return this._applicationInfo;
  }

  setNotificationPermission(notificationPermission: INotificationPermission) {
    this._notificationPermission = notificationPermission;
  }

  getNotificationPermission(): INotificationPermission {
    return this._notificationPermission;
  }

  setWhiteScreenChecker(whiteScreenChecker: IWhiteScreenChecker) {
    this._whiteScreenChecker = whiteScreenChecker;
  }

  getWhiteScreenChecker(): IWhiteScreenChecker {
    return this._whiteScreenChecker;
  }

}

export { Pal };
