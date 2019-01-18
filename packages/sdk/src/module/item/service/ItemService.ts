/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item, ItemFile } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { ItemServiceController } from '../controller/ItemServiceController';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { Progress } from '../../progress';
import { Post } from '../../post/entity';
import ItemAPI, { IRightRailItemModel } from '../../../api/glip/item';
import { ApiResult } from '../../../api/ApiResult';
import { ItemDao, daoManager } from '../../../dao';
import { SOCKET, ENTITY } from '../../../service/eventKey';
import { FileItemService } from '../module/file';
import { Api } from '../../../api';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { IItemService } from './IItemService';
import { transform, baseHandleData } from '../../../service/utils';
import { Raw } from '../../../framework/model';
import { ItemQueryOptions, ItemFilterFunction } from '../types';

class ItemService extends EntityBaseService<Item> implements IItemService {
  static serviceName = 'ItemService';

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

  handleIncomingData = async (items: Raw<Item>[]) => {
    if (items.length === 0) {
      return;
    }
    const transformedData = items.map(item => transform<Item>(item));
    // handle deactivated data and normal data
    this.handleSanitizedItems(transformedData);
    return baseHandleData({
      data: transformedData,
      dao: daoManager.getDao(ItemDao),
      eventKey: ENTITY.ITEM,
    });
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
    return this.itemServiceController.getItems(options);
  }

  async createItem(item: Item) {
    return await this.itemServiceController.createItem(item);
  }

  async updateItem(item: Item) {
    return await this.itemServiceController.updateItem(item);
  }

  async deleteItem(itemId: number) {
    return await this.itemServiceController.deleteItem(itemId);
  }

  async deleteItemData(itemId: number) {
    return await this.itemServiceController.itemActionController.deleteItem(
      itemId,
      this,
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
    let itemIds: number[] = [];
    posts.forEach((post: Post) => {
      if (post.item_ids && post.item_ids[0]) {
        itemIds = itemIds.concat(post.item_ids);
      }
      if (post.at_mention_item_ids && post.at_mention_item_ids[0]) {
        itemIds = itemIds.concat(post.at_mention_item_ids);
      }
    });
    const itemDao = daoManager.getDao(ItemDao);
    const items = await itemDao.getItemsByIds([
      ...Array.from(new Set(itemIds)),
    ]);
    return items;
  }

  getRightRailItemsOfGroup(groupId: number, limit?: number): Promise<Item[]> {
    ItemAPI.requestRightRailItems(groupId).then(
      (result: ApiResult<IRightRailItemModel>) => {
        if (result.isOk()) {
          this.handleIncomingData(result.data.items);
        }
      },
    );
    return (daoManager.getDao(ItemDao) as ItemDao).getItemsByGroupId(
      groupId,
      limit,
    );
  }

  async doNotRenderItem(id: number, type: string) {
    return await this._itemServiceController.itemActionController.doNotRenderItem(
      id,
      type,
    );
  }

  async handleSanitizedItems(items: Item[]) {
    return await this.itemServiceController.handleSanitizedItems(items);
  }
}

export { ItemService };
