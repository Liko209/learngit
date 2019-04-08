/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item, ItemFile } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { ItemServiceController } from '../controller/ItemServiceController';
import {
  GlipTypeUtil,
  TypeDictionary,
  PerformanceTracerHolder,
  PERFORMANCE_KEYS,
} from '../../../utils';
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
import { mainLogger } from 'foundation';
import { ItemNotification } from '../utils/ItemNotification';

class ItemService extends EntityBaseService<Item> implements IItemService {
  private _itemServiceController: ItemServiceController;

  constructor() {
    super(false, daoManager.getDao(ItemDao), {
      basePath: '/item',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.ITEM]: this.handleIncomingData,
      }),
    );
  }

  getItemDataHandler(): (items: Raw<Item>[]) => void {
    return this.handleIncomingData;
  }

  handleIncomingData = async (items: Raw<Item>[]) => {
    if (items.length === 0) {
      return;
    }
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_ITEM,
      logId,
    );
    const transformedData = items.map(item => transform<Item>(item));
    const result = await baseHandleData(
      {
        data: transformedData,
        dao: daoManager.getDao(ItemDao),
        eventKey: ENTITY.ITEM,
      },
      ItemNotification.getItemsNotifications,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
    return result;
  }

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
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      `${PERFORMANCE_KEYS.GOTO_CONVERSATION_SHELF_FETCH_ITEMS}_${
        options.typeId
      }`,
      logId,
    );
    const result = await this.itemServiceController.getItems(options);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
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
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_ITEMS,
      logId,
    );
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
      items = await this.getEntitySource().batchGet([
        ...Array.from(new Set(itemIds)),
      ]);
    }

    mainLogger.info(
      PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_ITEMS,
      ': item count:',
      String(itemIds.length),
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);

    return items;
  }

  async doNotRenderItem(id: number, type: string) {
    return await this._itemServiceController.itemActionController.doNotRenderItem(
      id,
      type,
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
    return this.itemServiceController.getItemIndexInfo(itemId, options);
  }
}

export { ItemService };
