/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-28 18:07:09
 * Copyright © RingCentral. All rights reserved.
 */

interface IImageDownloadedListener {
  onSuccess(
    item: { id: number; url?: string; thumbnail?: boolean; count?: number },
    width: number,
    height: number,
  ): void;
  onFailure(url: string, errorCode: number): void;
}

interface IImageDownloader {
  download(
    item: { id: number; url?: string; thumbnail?: boolean; count?: number },
    downloadListener: IImageDownloadedListener,
  ): void;
}

export { IImageDownloadedListener, IImageDownloader };
