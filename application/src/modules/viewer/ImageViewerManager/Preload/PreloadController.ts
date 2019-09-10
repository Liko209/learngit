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
import {
  SequenceProcessorHandler,
  SingletonSequenceProcessor,
} from 'sdk/framework/processor';
import { getLargeRawImageURL } from '@/common/getThumbnailURL';
import { mainLogger, ILogger } from 'foundation/log';
import { action } from 'mobx';

class PreloadController implements IImageDownloadedListener {
  private _logger: ILogger;
  private _cachedIds: Set<number>;
  private _pendingIds: number[] = [];
  private _inProgressId: number = 0;
  private _isAllowed: boolean = false;
  private _downloader: ImageDownloader;
  private _sequenceHandler: SequenceProcessorHandler;

  constructor() {
    const name = 'ViewerPreload';
    this._logger = mainLogger.tags(name);
    this._cachedIds = new Set<number>();
    this._downloader = new ImageDownloader();
    this._sequenceHandler = SingletonSequenceProcessor.getSequenceProcessorHandler(
      { name },
    );
  }

  dispose() {
    this._downloader.destroy();
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

  setIsAllowed(allowed: boolean) {
    const shouldStart = allowed && !this._isAllowed;
    if (allowed !== this._isAllowed) {
      this._logger.info(`Will switch _isAllowed to ${allowed}`);
    }
    this._isAllowed = allowed;

    shouldStart && this._startPreload();
  }

  getPendingIds() {
    return this._pendingIds;
  }

  getInProgressId() {
    return this._inProgressId;
  }

  onSuccess(item: DownloadItemInfo): void {
    this._logger.info(`onSuccess ${item.id}`);
    this._cachedIds.add(item.id);

    this._doNextPreload();
  }

  onFailure(item: DownloadItemInfo): void {
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
    return itemIds.filter((itemId: number) => !this._cachedIds.has(itemId));
  }

  @action
  private async _tryPreloadWithItemId(itemId: number) {
    const item: FileItemModel = getEntity(ENTITY_NAME.ITEM, itemId);
    if (!item || item.id <= 0) {
      this._logger.info(
        `Not start to preload ${itemId} due to no existing item: ${!!item}`,
      );
      return false;
    }

    this._logger.info(`Will process itemId: ${item.id}, ${item.name}`);
    const url = await getLargeRawImageURL(item);
    if (!url) {
      this._logger.info(`Not start to preload ${itemId} due to invalid url`);
      return false;
    }

    this._addToQueue(item.id, url);
    return true;
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
    if (!this._isAllowed) {
      this._logger.info('Not allow to preload');
      return;
    }
    if (this._inProgressId) {
      this._logger.info(`In progress: ${this._inProgressId}`);
      return;
    }
    if (!this._pendingIds || this._pendingIds.length === 0) {
      this._logger.info('Empty pendingIds');
      return;
    }
    this._inProgressId = this._pendingIds.shift()!;

    this._tryPreloadWithItemId(this._inProgressId).then((started: boolean) => {
      if (!started) {
        this._doNextPreload();
      }
    });
  }

  private _doNextPreload() {
    this._inProgressId = 0;

    this._startPreload();
  }
}

export { PreloadController };
