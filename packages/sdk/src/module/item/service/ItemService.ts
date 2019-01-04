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
import handleData from './handleData';
import { SOCKET } from '../../../service';
import { FileItemService } from '../module/file';
import { Api } from '../../../api';

class ItemService extends EntityBaseService<Item> {
  static serviceName = 'ItemService';

  private _itemServiceController: ItemServiceController;

  constructor() {
    super();

    this.setEntitySource(this._buildEntitySourceController());
    this.doSubscribe({
      [SOCKET.ITEM]: handleData,
    });
  }

  private _buildEntitySourceController() {
    const requestController = this.getControllerBuilder().buildRequestController(
      {
        basePath: '/item',
        networkClient: Api.glipNetworkClient,
      },
    );

    return this.getControllerBuilder().buildEntitySourceController(
      daoManager.getDao(ItemDao),
      requestController,
    );
  }

  protected get itemServiceController() {
    if (!this._itemServiceController) {
      this._itemServiceController = new ItemServiceController(
        this.getControllerBuilder(),
      );
    }
    return this._itemServiceController;
  }

  async getItems(
    typeId: number,
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ) {
    return this.itemServiceController.getItems(
      typeId,
      groupId,
      limit,
      offset,
      sortKey,
      desc,
    );
  }

  async createItem(item: Item) {
    return this.itemServiceController.createItem(item);
  }

  async updateItem(item: Item) {
    return this.itemServiceController.updateItem(item);
  }

  async deleteItem(itemId: number) {
    return this.itemServiceController.deleteItem(itemId);
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
          this.fileService.resendFailedFiles(id);
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
          handleData(result.data.items);
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
}

export { ItemService };
