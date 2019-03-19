/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-14 18:35:07
 * Copyright © RingCentral. All rights reserved.
 */

import { PreloadProcessor } from './PreloadProcessor';
import { ImageUtils } from '@/containers/Viewer/Utils';
import FileItemModel from '@/store/models/FileItem';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { ImageDownloader } from '@/common/ImageDownloader';
import { DownloadItemInfo, IImageDownloadedListener } from 'sdk/pal';
import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { mainLogger, ILogger } from 'sdk';

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
    const filteredIds = this._filterOutCachedIds(ids);
    this._logger.info(`replace with ${filteredIds}`);

    this._pendingIds = filteredIds;
    this._doNextPreload();
  }

  stop() {
    this._logger.info('Stop');
    this._pendingIds = [];
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
    this._inProgressId = 0;

    this._doNextPreload();
  }

  onFailure(item: DownloadItemInfo, errorCode: number): void {
    this._logger.info(`onFailure ${item.id}`);
    this._inProgressId = 0;

    this._doNextPreload();
  }

  onCancel(item: DownloadItemInfo): void {
    this._logger.info(`onCancel ${item.id}`);
    this._inProgressId = 0;

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

  private _generateProcessorWithItemId(itemId: number) {
    const item: FileItemModel = getEntity(ENTITY_NAME.ITEM, itemId);
    if (item) {
      const imageUrl = ImageUtils.fileImageInfo(item).url;
      const itemInfo: DownloadItemInfo = {
        id: item.id,
        url: imageUrl ? imageUrl : undefined,
      };
      this._logger.info(`Will process itemId: ${item.id}, ${imageUrl}`);

      return this._generateProcessor(itemInfo);
    }

    return undefined;
  }

  private _generateProcessor(itemInfo: DownloadItemInfo) {
    return new PreloadProcessor(itemInfo, this._downloader, this);
  }

  private _doNextPreload() {
    if (this._inProgressId) {
      this._logger.info(`In progress: ${this._inProgressId}`);
      return;
    }
    if (!this._pendingIds || this._pendingIds.length === 0) {
      this._logger.info('Empty _pendingIds');
      return;
    }
    this._inProgressId = this._pendingIds.shift()!;

    const processor = this._generateProcessorWithItemId(this._inProgressId);
    if (processor) {
      this._sequenceHandler.addProcessor(processor);
    }
  }
}

export { PreloadController };
