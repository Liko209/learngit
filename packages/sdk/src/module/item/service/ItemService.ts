/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item, ItemFile, ConferenceItem } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { ItemServiceController } from '../controller/ItemServiceController';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { Progress } from '../../progress';
import { Post } from '../../post/entity';
import { daoManager } from '../../../dao';
import { ItemDao } from '../dao';
import { SOCKET, ENTITY } from '../../../service/eventKey';
import { FileItemService } from '../module/file';
import { Api } from '../../../api';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { IItemService } from './IItemService';
import { transform, baseHandleData } from '../../../service/utils';
import { Raw } from '../../../framework/model';
import { ItemQueryOptions, ItemFilterFunction } from '../types';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { ItemNotification } from '../utils/ItemNotification';
import { ChangeModel } from '../../sync/types';
import { NoteItemService } from '../module/note/service';
import { ITEM_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { RequestHolder, ProgressCallback } from 'sdk/api/glip/item';
import { ItemEntityCacheController } from '../controller/ItemEntityCacheController'

const INVALID_ITEM_ID = [-1, -2, null];
const LOG_NAME = 'ItemService';
const TYPE_ITEM_CACHE_SIZE = 20;
class ItemService extends EntityBaseService<Item> implements IItemService {
  private _itemServiceController: ItemServiceController;

  constructor() {
    super({ isSupportedCache: true }, daoManager.getDao(ItemDao), {
      basePath: '/item',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.ITEM]: this.handleIncomingData,
      }),
    );
  }

  protected buildEntityCacheController() {
    return ItemEntityCacheController.buildItemEntityCacheController(TYPE_ITEM_CACHE_SIZE);
  }

  getItemDataHandler(): (items: Raw<Item>[]) => void {
    return this.handleIncomingData;
  }

  handleIncomingData = async (
    items: Raw<Item>[],
    changeMap?: Map<string, ChangeModel>,
  ) => {
    if (items.length === 0) {
      return;
    }
    const transformedData = items.map(item => transform<Item>(item));
    const result = await baseHandleData(
      {
        changeMap,
        data: transformedData,
        dao: daoManager.getDao(ItemDao),
        eventKey: ENTITY.ITEM,
        entitySourceController: this.getEntitySource(),
      },
      ItemNotification.getItemsNotifications,
    );
    return result;
  };

  protected get itemServiceController() {
    if (!this._itemServiceController) {
      this._itemServiceController = new ItemServiceController(
        this,
        this.getEntitySource(),
      );
    }
    return this._itemServiceController;
  }

  async getGroupItemsCount(
    groupId: number,
    typeId: number,
    filterFunc?: ItemFilterFunction,
  ) {
    return this.itemServiceController.getGroupItemsCount(
      groupId,
      typeId,
      filterFunc,
    );
  }

  async getItems(options: ItemQueryOptions) {
    const performanceTracer = PerformanceTracer.start();
    const result = await this.itemServiceController.getItems(options);
    performanceTracer.end({
      key: ITEM_PERFORMANCE_KEYS.GOTO_CONVERSATION_SHELF_FETCH_ITEMS,
      infos: { typeId: options.typeId },
    });
    return result;
  }

  async deleteItem(itemId: number) {
    return await this.itemServiceController.itemActionController.deleteItem(
      itemId,
    );
  }

  protected get fileService() {
    return this.itemServiceController.getSubItemService(
      TypeDictionary.TYPE_ID_FILE,
    ) as FileItemService;
  }

  protected get noteService() {
    return this.itemServiceController.getSubItemService(
      TypeDictionary.TYPE_ID_PAGE,
    ) as NoteItemService;
  }

  async sendItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): Promise<ItemFile | null> {
    return await this.fileService.sendItemFile(groupId, file, isUpdate);
  }

  deleteFileItemCache(id: number) {
    this.fileService.deleteFileCache(id);
  }

  async sendItemData(groupId: number, itemIds: number[]) {
    const fileItemIds = itemIds.filter(
      id => GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_FILE,
    );
    await this.fileService.sendItemData(groupId, fileItemIds);
  }

  async getItemVersion(itemFile: ItemFile): Promise<number> {
    return await this.fileService.getFileItemVersion(itemFile);
  }

  async cancelUpload(itemId: number) {
    await this.fileService.cancelUpload(itemId);
  }

  getUploadItems(groupId: number): ItemFile[] {
    return this.fileService.getUploadItems(groupId);
  }

  async initialUploadItemsFromDraft(groupId: number) {
    return await this.fileService.initialUploadItemsFromDraft(groupId);
  }

  async canResendFailedItems(itemIds: number[]) {
    const fileItemsIds = itemIds.filter(
      id => GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_FILE,
    );
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < fileItemsIds.length; i++) {
      if (!(await this.fileService.hasValidItemFile(fileItemsIds[i]))) {
        return false;
      }
    }
    return true;
  }

  async resendFailedItems(itemIds: number[]) {
    await Promise.all(
      itemIds.map((id: number) => {
        if (GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_FILE) {
          this.fileService.resendFailedFile(id);
        }
      }),
    );
  }

  async isFileExists(groupId: number, fileName: string): Promise<boolean> {
    return await this.fileService.isFileExists(groupId, fileName);
  }

  canUploadFiles(
    groupId: number,
    newFiles: File[],
    includeUnSendFiles: boolean,
  ): boolean {
    return this.fileService.canUploadFiles(
      groupId,
      newFiles,
      includeUnSendFiles,
    );
  }

  getUploadProgress(itemId: number): Progress | undefined {
    return this.fileService.getUploadProgress(itemId);
  }

  getItemsSendingStatus(itemIds: number[]) {
    return this.fileService.getItemsSendingStatus(itemIds);
  }

  cleanUploadingFiles(groupId: number, itemIds: number[]) {
    this.fileService.cleanUploadingFiles(groupId, itemIds);
  }

  async getByPosts(posts: Post[]): Promise<Item[]> {
    const performanceTracer = PerformanceTracer.start();
    let itemIds: number[] = [];
    posts.forEach((post: Post) => {
      if (post.item_ids && post.item_ids[0]) {
        itemIds = itemIds.concat(post.item_ids);
      }
      if (post.at_mention_item_ids && post.at_mention_item_ids[0]) {
        itemIds = itemIds.concat(post.at_mention_item_ids);
      }
    });

    let items: Item[] = [];
    if (itemIds.length > 0) {
      itemIds = itemIds.filter(id => !INVALID_ITEM_ID.includes(id));
      items = await this.getEntitySource().batchGet([
        ...Array.from(new Set(itemIds)),
      ]);
    }

    mainLogger.info(
      ITEM_PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_ITEMS,
      ': item count:',
      String(itemIds.length),
    );
    performanceTracer.end({
      key: ITEM_PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_ITEMS,
      count: itemIds.length,
    });
    return items;
  }

  async doNotRenderItem(id: number, type: string) {
    return await this._itemServiceController.itemActionController.doNotRenderItem(
      id,
      type,
    );
  }

  cancelZoomMeeting(id: number): Promise<void> {
    return this._itemServiceController.itemActionController.cancelZoomMeeting(
      id,
    );
  }

  async requestSyncGroupItems(groupId: number) {
    await this.itemServiceController.itemSyncController.requestSyncGroupItems(
      groupId,
    );
  }

  async getThumbsUrlWithSize(itemId: number, width?: number, height?: number) {
    return this.fileService.getThumbsUrlWithSize(itemId, width, height);
  }

  hasUploadingFiles() {
    return this.fileService.hasUploadingFiles();
  }

  async getItemIndexInfo(
    itemId: number,
    options: ItemQueryOptions,
  ): Promise<{ index: number; totalCount: number }> {
    const result = this.itemServiceController.getItemIndexInfo(itemId, options);
    mainLogger.tags(LOG_NAME).info('getItemIndexInfo', result);
    return result;
  }

  async editFileName(itemId: number, newName: string): Promise<void> {
    await this.fileService.editFileName(itemId, newName);
  }

  async deleteFile(itemId: number, version: number): Promise<void> {
    await this.fileService.deleteFile(itemId, version);
  }

  async getNoteBody(itemId: number) {
    return await this.noteService.getNoteBody(itemId);
  }

  async uploadFileToServer(
    file: File,
    progressCallback?: ProgressCallback,
    requestHolder?: RequestHolder,
  ) {
    return await this.fileService.uploadFileToServer(
      file,
      progressCallback,
      requestHolder,
    );
  }

  async startConference(groupId: number): Promise<ConferenceItem> {
    return this.itemServiceController.itemActionController.startConference(
      groupId,
    );
  }
}

export { ItemService };
