/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 10:00:51
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import BaseService from '../../service/BaseService';
import { daoManager, ItemDao } from '../../dao';
import ItemAPI, { IRightRailItemModel } from '../../api/glip/item';
import handleData from './handleData';
import { transform } from '../utils';
import { Progress } from '../../models';
import { Item, ItemFile, NoteItem } from '../../module/item/entity';
import { Raw } from '../../framework/model';
import { Post } from '../../module/post/entity';

import { SOCKET } from '../eventKey';
import { ApiResult } from '../../api/ApiResult';
import { ItemFileUploadHandler } from './itemFileUploadHandler';
import { GlipTypeUtil, TypeDictionary } from '../../utils/glip-type-dictionary';
import { JError } from '../../error';

class ItemService extends BaseService<Item> {
  static serviceName = 'ItemService';
  _itemFileUploadHandler: ItemFileUploadHandler;

  constructor() {
    const subscription = {
      [SOCKET.ITEM]: handleData,
    };
    super(ItemDao, ItemAPI, handleData, subscription);
  }

  async sendItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): Promise<ItemFile | null> {
    return await this._getItemFileHandler().sendItemFile(
      groupId,
      file,
      isUpdate,
    );
  }

  deleteFileItemCache(id: number) {
    this._getItemFileHandler().deleteFileCache(id);
  }

  async sendItemData(groupId: number, itemIds: number[]) {
    const fileItemIds = itemIds.filter(
      id => GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_FILE,
    );
    await this._getItemFileHandler().sendItemData(groupId, fileItemIds);
  }

  async getItemVersion(itemFile: ItemFile): Promise<number> {
    return await this._getItemFileHandler().getUpdateItemVersion(itemFile);
  }

  async cancelUpload(itemId: number) {
    await this._getItemFileHandler().cancelUpload(itemId);
  }

  getUploadItems(groupId: number): ItemFile[] {
    return this._getItemFileHandler().getUploadItems(groupId);
  }

  async canResendFailedItems(itemIds: number[]) {
    const fileItemsIds = itemIds.filter(
      id => GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_FILE,
    );
    for (let i = 0; i < fileItemsIds.length; i++) {
      if (
        !(await this._getItemFileHandler().canResendFailedFile(fileItemsIds[i]))
      ) {
        return false;
      }
    }
    return true;
  }

  async resendFailedItems(itemIds: number[]) {
    await Promise.all(
      itemIds.map((id: number) => {
        if (GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_FILE) {
          this._getItemFileHandler().resendFailedFile(id);
        }
      }),
    );
  }

  async isFileExists(groupId: number, fileName: string): Promise<boolean> {
    if (groupId <= 0 || !fileName || fileName.trim().length === 0) {
      return false;
    }
    const dao = daoManager.getDao(this.DaoClass) as ItemDao;
    const files = await dao.getExistGroupFilesByName(groupId, fileName, true);
    return files.length > 0
      ? files.some((x: Item) => {
        return x.post_ids.length > 0;
      })
      : false;
  }

  canUploadFiles(
    groupId: number,
    newFiles: File[],
    includeUnSendFiles: boolean,
  ): boolean {
    return this._getItemFileHandler().canUploadFiles(
      groupId,
      newFiles,
      includeUnSendFiles,
    );
  }

  getUploadProgress(itemId: number): Progress | undefined {
    return this._getItemFileHandler().getUploadProgress(itemId);
  }

  getItemsSendingStatus(itemIds: number[]) {
    return this._getItemFileHandler().getItemsSendStatus(itemIds);
  }

  getRightRailItemsOfGroup(groupId: number, limit?: number): Promise<Item[]> {
    ItemAPI.requestRightRailItems(groupId).then(
      (result: ApiResult<IRightRailItemModel>) => {
        if (result.isOk()) {
          handleData(result.data.items);
        }
      },
    );
    return (daoManager.getDao(this.DaoClass) as ItemDao).getItemsByGroupId(
      groupId,
      limit,
    );
  }

  cleanUploadingFiles(groupId: number, itemIds: number[]) {
    this._getItemFileHandler().cleanUploadingFiles(groupId, itemIds);
  }

  async getNoteById(id: number): Promise<NoteItem | null> {
    const item = (await this.getByIdFromDao(id)) as NoteItem;
    if (item) {
      return item;
    }

    const result = await ItemAPI.getNote(id);

    return result.match({
      Ok: async (rawNoteItem: Raw<NoteItem>) => {
        const note = transform<NoteItem>(rawNoteItem);
        await handleData([rawNoteItem]);
        return note;
      },
      Err: () => null,
    });
  }

  async doNotRenderItem(id: number, type: string) {
    const itemDao = daoManager.getDao(ItemDao);
    const item = (await itemDao.get(id)) as Item;
    if (item) {
      return await this.handlePartialUpdate(
        {
          id: item.id,
          _id: item.id,
          do_not_render: true,
        },
        undefined,
        this._doUpdateItemModel.bind(this, item, type),
      );
    }
    return false;
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

  private async _doUpdateItemModel(
    updatedItemModel: Item,
    type: string,
  ): Promise<Raw<Item> | JError> {
    updatedItemModel.do_not_render = true;
    updatedItemModel._id = updatedItemModel.id;
    delete updatedItemModel.id;

    const result = await ItemAPI.putItem(
      updatedItemModel._id,
      type,
      updatedItemModel,
    );

    return result.match({
      Ok: (item: Raw<Item>) => item,
      Err: (e: JError) => e,
    });
  }

  private _getItemFileHandler(): ItemFileUploadHandler {
    if (!this._itemFileUploadHandler) {
      this._itemFileUploadHandler = new ItemFileUploadHandler();
    }
    return this._itemFileUploadHandler;
  }
}

export { ItemService };
