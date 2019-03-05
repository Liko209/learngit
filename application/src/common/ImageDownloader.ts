/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-05 10:25:38
 * Copyright © RingCentral. All rights reserved.
 */

import { IImageDownloader, IImageDownloadedListener } from 'sdk/pal';
import { mainLogger } from 'sdk';

class ImageDownloader implements IImageDownloader {
  private _imgElement: HTMLImageElement;
  private _downloadListener: IImageDownloadedListener;
  private _image: {
    id: number;
    url: string;
    thumbnail: boolean;
    count?: number;
  };
  constructor() {
    this._imgElement = this._createImagElement();
    this._imgElement.addEventListener('load', () => {
      mainLogger.info(
        'ImageDownloader, download successfully!',
        `width: ${this._imgElement.width}`,
        `height: ${this._imgElement.height}`,
      );
      this._downloadListener.onSuccess(
        this._image,
        this._imgElement.width,
        this._imgElement.height,
      );
    });

    this._imgElement.addEventListener('error', () => {
      mainLogger.info('ImageDownloader, downloaded error');
      this._downloadListener.onFailure(this._image.url, 0);
    });
  }

  private _createImagElement() {
    const imgElement = document.createElement('img');
    imgElement.style.display = 'none';
    document.body.appendChild(imgElement);
    return imgElement;
  }

  download(
    image: { id: number; url: string; thumbnail: boolean; count?: number },
    downloadListener: IImageDownloadedListener,
  ) {
    mainLogger.info('ImageDownloader, start downloading:', image.url);
    this._image = image;
    this._downloadListener = downloadListener;
    this._imgElement.setAttribute('src', this._image.url);
  }
}

export { ImageDownloader };
