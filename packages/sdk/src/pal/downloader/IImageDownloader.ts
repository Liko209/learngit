/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-28 18:07:09
 * Copyright © RingCentral. All rights reserved.
 */

type DownloadItemInfo = {
  id: number;
  url?: string;
  thumbnail?: boolean;
  count?: number;
};

interface IImageDownloadedListener {
  onSuccess(item: DownloadItemInfo, width: number, height: number): void;
  onFailure(item: DownloadItemInfo, errorCode: number): void;
  onCancel(item: DownloadItemInfo): void;
}

interface IImageDownloader {
  download(
    item: DownloadItemInfo,
    downloadListener: IImageDownloadedListener,
  ): void;
}

export { DownloadItemInfo, IImageDownloadedListener, IImageDownloader };
