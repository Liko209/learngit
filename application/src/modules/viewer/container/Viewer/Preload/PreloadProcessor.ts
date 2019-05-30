/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-14 18:35:10
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from 'sdk/framework/processor';
import { ImageDownloader } from '@/common/ImageDownloader';
import { DownloadItemInfo, IImageDownloadedListener } from 'sdk/pal';

class PreloadProcessor implements IProcessor {
  constructor(
    private _itemInfo: DownloadItemInfo,
    private _imageDownloader: ImageDownloader,
    private _listner: IImageDownloadedListener,
  ) {}

  async process(): Promise<boolean> {
    this._imageDownloader.download(this._itemInfo, this._listner);

    return true;
  }

  canContinue(): boolean {
    return true;
  }

  name(): string {
    return this._itemInfo.url
      ? this._itemInfo.url
      : this._itemInfo.id.toString();
  }
}

export { PreloadProcessor };
