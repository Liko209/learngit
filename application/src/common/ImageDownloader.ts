/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-05 10:25:38
 * Copyright © RingCentral. All rights reserved.
 */

import {
  DownloadItemInfo,
  IImageDownloader,
  IImageDownloadedListener,
} from 'sdk/pal';
import { mainLogger, ILogger } from 'foundation/log';
import { accelerateURL } from './accelerateURL';

const logTag = 'ImageDownloader';

class ImageDownloader implements IImageDownloader {
  private _imgElement: HTMLImageElement;
  private _downloadListener?: IImageDownloadedListener;
  private _itemInfo?: DownloadItemInfo;
  private _logger: ILogger;

  constructor() {
    this._logger = mainLogger.tags(logTag);
    this._imgElement = this._createImageElement();
  }

  public destroy() {
    this._removeImageElement();
  }

  public download(
    itemInfo: DownloadItemInfo,
    downloadListener?: IImageDownloadedListener,
  ) {
    if (!itemInfo.url) {
      this._logger.info('ignore download due to empty url');
      downloadListener && downloadListener.onFailure(itemInfo, 0);
      return;
    }
    const url = accelerateURL(itemInfo.url);
    itemInfo.url = url;
    this._logger.info('start', `itemId: ${itemInfo.id}`, `url: ${url}`);

    this.cancelLoadingImage();

    this._itemInfo = itemInfo;
    this._downloadListener = downloadListener;
    this._imgElement.setAttribute('src', url!);
  }

  public cancelLoadingImage() {
    if (this._itemInfo) {
      this._logger.info(
        'cancel',
        `itemId: ${this._itemInfo.id}`,
        `src: ${this._imgElement.getAttribute('src')}`,
      );

      const listener = this._downloadListener;
      const itemInfo = this._itemInfo;
      this._resetImage();
      listener && listener.onCancel(itemInfo);
    }
  }

  private _createImageElement() {
    const imgElement = document.createElement('img');
    imgElement.style.display = 'none';
    imgElement.addEventListener('load', this._onLoadHandler);
    imgElement.addEventListener('error', this._onErrorHandler);
    document.body.appendChild(imgElement);

    return imgElement;
  }

  private _removeImageElement() {
    if (this._imgElement) {
      this._imgElement.removeEventListener('load', this._onLoadHandler);
      this._imgElement.removeEventListener('error', this._onErrorHandler);
      document.body.removeChild(this._imgElement);
    }
  }

  private _onLoadHandler = () => {
    if (!this._itemInfo) {
      this._logger.info(
        'onload without itemInfo',
        this._imgElement && this._imgElement.getAttribute('src'),
      );

      return;
    }

    const { width, height } = this._imgElement;

    this._logger.info(
      'onload',
      `itemId: ${this._itemInfo.id}`,
      `url: ${this._itemInfo.url}`,
      `width: ${width}`,
      `height: ${height}`,
    );

    const listener = this._downloadListener;
    const itemInfo = this._itemInfo;
    this._resetImage();
    listener && listener.onSuccess(itemInfo, width, height);
  };

  private _onErrorHandler = (ev: ErrorEvent) => {
    if (!this._itemInfo) {
      this._logger.info(
        'onerror without itemInfo',
        this._imgElement && this._imgElement.getAttribute('src'),
      );

      return;
    }

    this._logger.info(
      'onerror',
      ev,
      `itemId: ${this._itemInfo.id}`,
      `url: ${this._itemInfo.url}`,
    );

    const listener = this._downloadListener;
    const itemInfo = this._itemInfo;
    this._resetImage();
    listener && listener.onFailure(itemInfo, 0);
  };

  private _resetImage() {
    this._itemInfo = undefined;
    this._downloadListener = undefined;

    // Will run into load the current history path
    // this._imgElement.setAttribute('src', '');
  }
}

export { ImageDownloader };
