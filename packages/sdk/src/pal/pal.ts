/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-28 18:19:57
 * Copyright © RingCentral. All rights reserved.
 */

import { IImageDownloader } from './downloader';
import { IErrorReporter } from './errorReporter';
import { IApplicationInfo } from './applicationInfo';

class Pal {
  private static _sPalInstance: Pal;
  private _imageDownloader: IImageDownloader;
  private _errorReporter: IErrorReporter;
  private _applicationInfo: IApplicationInfo;

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
}

export { Pal };
