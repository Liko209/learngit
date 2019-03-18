/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 19:10:13
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor, SequenceProcessorHandler } from 'sdk/framework/processor';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { ItemService, FileItemUtils } from 'sdk/module/item';
import { getThumbnailURL } from '@/common/getThumbnailURL';
import { Pal, IImageDownloadedListener } from 'sdk/pal';

import {
  generateModifiedImageURL,
  RULE,
  Result,
} from '../../../../common/generateModifiedImageURL';
import { mainLogger } from 'sdk';

class ImageDownloadedListener implements IImageDownloadedListener {
  constructor(
    private _sequenceProcessorHandler: SequenceProcessorHandler,
    private _waiter: any,
  ) {}
  onSuccess(
    item: {
      id: number;
      url?: string;
      thumbnail?: boolean;
      count?: number | undefined;
    },
    width: number,
    height: number,
  ): void {
    if (!item.thumbnail) {
      const rule = item.count ? RULE.SQUARE_IMAGE : RULE.RECTANGLE_IMAGE;

      generateModifiedImageURL({
        rule,
        id: item.id,
        origWidth: width,
        origHeight: height,
        squareSize: 180,
      }).then((result: Result) => {
        this._sequenceProcessorHandler.addProcessor(
          new ThumbnailPreloadProcessor(this._sequenceProcessorHandler, {
            id: item.id,
            url: result.url,
            thumbnail: true,
            autoPreload: true,
          }),
        );
      });
    }

    this._waiter();
  }
  onFailure(url: string, errorCode: number): void {
    this._waiter();
  }
}

class ThumbnailPreloadProcessor implements IProcessor {
  private _item: {
    id: number;
    url?: string;
    thumbnail?: boolean;
    count?: number;
    autoPreload?: boolean;
  };
  constructor(
    private _sequenceProcessorHandler: SequenceProcessorHandler,
    item: {
      id: number;
      url?: string;
      thumbnail?: boolean;
      count?: number;
      autoPreload?: boolean;
    },
  ) {
    this._item = item;
  }

  private _hasVersions(file: FileItem) {
    return file.versions && file.versions.length > 0;
  }

  private _getVersionsValue(file: FileItem, type: string) {
    return file.versions[0][type];
  }

  private _getOrigHeight(file: FileItem) {
    return this._hasVersions(file)
      ? this._getVersionsValue(file, 'orig_height')
      : null;
  }

  private _getOrigWidth(file: FileItem) {
    return this._hasVersions(file)
      ? this._getVersionsValue(file, 'orig_width')
      : null;
  }

  toThumbnailUrl(fileItem: FileItem) {
    const originalWidth = this._getOrigWidth(fileItem);
    const originalHeight = this._getOrigHeight(fileItem);
    if (originalWidth && originalHeight) {
      const url = getThumbnailURL(fileItem);
      if (url && url.length) {
        return { url, thumbnail: true };
      }
    }

    if (fileItem.versions.length && fileItem.versions[0].url) {
      return {
        url: fileItem.versions[0].url,
        thumbnail: false,
      };
    }

    return null;
  }

  protected preload(item: {
    id: number;
    url?: string;
    thumbnail?: boolean;
    count?: number;
  }) {
    return new Promise((resolve: any, reject: any) => {
      Pal.instance
        .getImageDownloader()
        .download(
          item,
          new ImageDownloadedListener(this._sequenceProcessorHandler, resolve),
        );
    });
  }

  async process(): Promise<boolean> {
    if (this._item.autoPreload) {
      await this.preload(this._item);
    } else {
      try {
        const itemService = ItemService.getInstance() as ItemService;
        const item = await itemService.getById(this._item.id);
        if (item && item.id > 0) {
          if (!FileItemUtils.isSupportPreview(item)) {
            return false;
          }

          const thumbnail = this.toThumbnailUrl(item);
          if (!thumbnail) {
            return true;
          }

          this._item.url = thumbnail.url;
          this._item.thumbnail = thumbnail.thumbnail;

          await this.preload(this._item);
        }
      } catch (err) {
        mainLogger.warn(
          'ThumbnailPreloadProcessor: process(): error=',
          err.message,
        );
      }
    }

    return true;
  }

  canContinue(): boolean {
    return true;
  }

  name(): string {
    return this._item.url ? this._item.url : this._item.id.toString();
  }
}

export { ThumbnailPreloadProcessor };
