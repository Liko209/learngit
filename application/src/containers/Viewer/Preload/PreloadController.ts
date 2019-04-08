/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-14 18:35:07
 * Copyright © RingCentral. All rights reserved.
 */

import { PreloadProcessor } from './PreloadProcessor';
import FileItemModel from '@/store/models/FileItem';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { ImageDownloader } from '@/common/ImageDownloader';
import { DownloadItemInfo, IImageDownloadedListener } from 'sdk/pal';
import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { getMaxThumbnailURLInfo } from '@/common/getThumbnailURL';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { mainLogger, ILogger } from 'sdk';
import { ItemService } from 'sdk/module/item/service';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class PreloadController implements IImageDownloadedListener {
  private _logger: ILogger;
  private _cachedIds: Set<number>;
  private _pendingIds: number[] = [];
  private _inProgressId: number = 0;
  private _downloader: ImageDownloader;
  private _sequenceHandler: SequenceProcessorHandler;

  constructor() {
    const name = 'ViewerPreload';
    this._logger = mainLogger.tags(name);
    this._cachedIds = new Set<number>();
    this._downloader = new ImageDownloader();
    this._sequenceHandler = new SequenceProcessorHandler(name);
  }

  replacePreload(itemIds: number[], currentIndex: number) {
    const ids = this._generatePreloadIds(itemIds, currentIndex);
    this._logger.info(`Replace with ${ids}`);
    const filteredIds = this._filterOutCachedIds(ids);
    this._logger.info(`Filter by cache ${filteredIds}`);

    this._pendingIds = filteredIds;
    this._startPreload();
  }

  stop() {
    this._logger.info('Stop');
    this._pendingIds = [];

    this._downloader.cancelLoadingImage();
  }

  getPendingIds() {
    return this._pendingIds;
  }

  getInProgressId() {
    return this._inProgressId;
  }

  onSuccess(item: DownloadItemInfo, width: number, height: number): void {
    this._logger.info(`onSuccess ${item.id}`);
    this._cachedIds.add(item.id);

    this._doNextPreload();
  }

  onFailure(item: DownloadItemInfo, errorCode: number): void {
    this._logger.info(`onFailure ${item.id}`);

    this._doNextPreload();
  }

  onCancel(item: DownloadItemInfo): void {
    this._logger.info(`onCancel ${item.id}`);

    this._doNextPreload();
  }

  private _pushByIndex(fromIds: number[], toIds: number[], index: number) {
    if (index >= 0 && index < fromIds.length) {
      toIds.push(fromIds[index]);
    }
  }

  private _generatePreloadIds(itemIds: number[], currentIndex: number) {
    const ids: number[] = [];
    this._pushByIndex(itemIds, ids, currentIndex + 1);
    this._pushByIndex(itemIds, ids, currentIndex - 1);
    this._pushByIndex(itemIds, ids, currentIndex + 2);
    this._pushByIndex(itemIds, ids, currentIndex - 2);

    return ids;
  }

  private _filterOutCachedIds(itemIds: number[]) {
    return itemIds.filter((itemId: number) => {
      return !this._cachedIds.has(itemId);
    });
  }

  private _tryPreloadWithItemId(itemId: number) {
    const item: FileItemModel = getEntity(ENTITY_NAME.ITEM, itemId);
    if (!item || item.id <= 0) {
      return false;
    }

    this._logger.info(`Will process itemId: ${item.id}, ${item.name}`);
    if (FileItemUtils.isSupportShowRawImage(item)) {
      if (item.versionUrl) {
        this._addToQueue(item.id, item.versionUrl);
        return true;
      }
    }

    if (FileItemUtils.isSupportPreview(item)) {
      if (item.thumbs) {
        const imageUrl = getMaxThumbnailURLInfo(item).url;
        this._addToQueue(item.id, imageUrl);
        return true;
      }

      const itemService = ServiceLoader.getInstance<ItemService>(
        ServiceConfig.ITEM_SERVICE,
      );
      itemService
        .getThumbsUrlWithSize(item.id, item.origWidth, item.origHeight)
        .then((url: string) => {
          this._addToQueue(item.id, url);
        })
        .catch(() => {
          this._doNextPreload();
        });
      return true;
    }

    return false;
  }

  private _addToQueue(itemId: number, url: string) {
    const itemInfo: DownloadItemInfo = {
      url,
      id: itemId,
    };
    const processor = new PreloadProcessor(itemInfo, this._downloader, this);
    this._sequenceHandler.addProcessor(processor);
  }

  private _startPreload() {
    if (this._inProgressId) {
      this._logger.info(`In progress: ${this._inProgressId}`);
      return;
    }
    if (!this._pendingIds || this._pendingIds.length === 0) {
      this._logger.info('Empty pendingIds');
      return;
    }
    this._inProgressId = this._pendingIds.shift()!;

    if (!this._tryPreloadWithItemId(this._inProgressId)) {
      this._doNextPreload();
    }
  }

  private _doNextPreload() {
    this._inProgressId = 0;

    this._startPreload();
  }
}

export { PreloadController };
