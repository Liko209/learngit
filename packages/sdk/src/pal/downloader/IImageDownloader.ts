/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-28 18:07:09
 * Copyright © RingCentral. All rights reserved.
 */

interface IImageDownloadedListener {
  onSuccess(url: string);
  onFailure(url: string, errorCode: number);
}

interface IImageDownloader {
  download(url, downloadListener: IImageDownloadedListener): Promise<void>;
  getThumbnailSize(count: number): { width: number; height: number };
}

export { IImageDownloadedListener, IImageDownloader };
