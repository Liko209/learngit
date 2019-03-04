/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 12:20:43
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor, SequenceProcessorHandler } from 'sdk/framework/processor';
import { Pal, IImageDownloadedListener } from 'sdk/pal';
import {
  generateModifiedImageURL,
  RULE,
  Result,
} from '../../../../common/generateModifiedImageURL';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { ItemService } from 'sdk/module/item';
import { getThumbnailURL } from '@/common/getThumbnailURL';

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
          new ImageDownloadProcessor(this._sequenceProcessorHandler, {
            id: item.id,
            url: result.url,
            thumbnail: true,
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

class ImageDownloadProcessor implements IProcessor {
  private _item: {
    id: number;
    url?: string;
    thumbnail?: boolean;
    count?: number;
  };
  constructor(
    private _sequenceProcessorHandler: SequenceProcessorHandler,
    item: {
      id: number;
      url?: string;
      thumbnail?: boolean;
      count?: number;
    },
  ) {
    this._item = item;
  }

  hasVersions(file: FileItem) {
    return file.versions && file.versions.length > 0;
  }

  getVersionsValue(file: FileItem, type: string) {
    return file.versions[0][type] ? file.versions[0][type] : null;
  }

  getOrigHeight(file: FileItem) {
    if (!this.hasVersions(file)) return null;
    return this.getVersionsValue(file, 'orig_height');
  }

  getOrigWidth(file: FileItem) {
    if (!this.hasVersions(file)) return null;
    return this.getVersionsValue(file, 'orig_width');
  }

  getOrigSize(fileItem: FileItem) {
    let origWidth: number = 0;
    let origHeight: number = 0;

    origWidth = this.getOrigWidth(fileItem);
    origHeight = this.getOrigWidth(fileItem);

    return { origWidth, origHeight };
  }

  toThumbnailUrl(fileItem: FileItem) {
    const originalSize = this.getOrigSize(fileItem);
    if (originalSize.origHeight && originalSize.origWidth) {
      const url = getThumbnailURL(fileItem);
      if (url && url.length) {
        return { url, thumbnail: true };
      }
    }

    if (fileItem.versions[0].url) {
      return {
        url: fileItem.versions[0].url,
        thumbnail: false,
      };
    }

    return null;
  }
  async process(): Promise<boolean> {
    const itemService = ItemService.getInstance() as ItemService;
    const item = await itemService.getById(this._item.id);
    if (item) {
      const url = this.toThumbnailUrl(item);
      if (!url) {
        return true;
      }

      this._item.url = url.url;
      this._item.thumbnail = url.thumbnail;

      const p = new Promise((resolve: any, reject: any) => {
        Pal.instance
          .getImageDownloader()
          .download(
            this._item,
            new ImageDownloadedListener(this._sequenceProcessorHandler, resolve),
          );
      });

      await p;
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

class ThumbnailPreloadController {
  private _sequenceProcessorHandler: SequenceProcessorHandler = new SequenceProcessorHandler(
    'Thumbnail Sequence Processor',
  );

  async handleFileItems(ids: number[]) {
    ids.forEach((id: number) => {
      this._sequenceProcessorHandler.addProcessor(
        new ImageDownloadProcessor(this._sequenceProcessorHandler, {
          id,
          count: ids.length,
        }),
      );
    });
  }
}

export { ThumbnailPreloadController };
