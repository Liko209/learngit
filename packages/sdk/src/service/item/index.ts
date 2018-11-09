/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-07 14:19:08
 */
import BaseService from '../../service/BaseService';
import { daoManager, ItemDao } from '../../dao';
import ItemAPI from '../../api/glip/item';
import handleData, { sendFileItem, uploadStorageFile } from './handleData';
import { transform } from '../utils';
import { StoredFile, Item, FileItem, NoteItem } from '../../models';
import { BaseError } from '../../utils';
import { SOCKET } from '../eventKey';
import ErrorParser from '../../utils/error/parser';

export interface ISendFile {
  file: FormData;
  groupId?: string;
}

export default class ItemService extends BaseService<Item> {
  static serviceName = 'ItemService';

  constructor() {
    const subscription = {
      [SOCKET.ITEM]: handleData,
    };
    super(ItemDao, ItemAPI, handleData, subscription);
  }

  async sendFile(params: ISendFile): Promise<FileItem | null> {
    const options: StoredFile = await uploadStorageFile(params);
    const itemOptions = {
      storedFile: options[0],
      groupId: params.groupId,
    };
    const result = await sendFileItem(itemOptions);
    if (result) {
      const fileItem = transform<FileItem>(result);
      await handleData([result]);
      return fileItem;
    }
    return null;
  }

  getRightRailItemsOfGroup(groupId: number, limit?: number): Promise<Item[]> {
    ItemAPI.requestRightRailItems(groupId).then(({ data }) => {
      if (data && data.items && data.items.length) {
        handleData(data.items);
      }
    });
    return (daoManager.getDao(this.DaoClass) as ItemDao).getItemsByGroupId(
      groupId,
      limit,
    );
  }

  async getNoteById(id: number): Promise<NoteItem | null> {
    const result = (await this.getByIdFromDao(id)) as NoteItem;
    if (result) {
      return result;
    }

    const resp = await ItemAPI.getNote(id);
    if (resp.data) {
      const note = transform<NoteItem>(resp.data);
      await handleData([resp.data]);
      return note;
    }

    // should handle errors when error handling ready
    return null;
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
  private async _doUpdateItemModel(
    updatedItemModel: Item,
    type: string,
  ): Promise<Item | BaseError> {
    updatedItemModel.do_not_render = true;
    updatedItemModel._id = updatedItemModel.id;
    delete updatedItemModel.id;
    let itemData: Item;
    const resp = ItemAPI.putItem<Item>(
      updatedItemModel._id,
      type,
      updatedItemModel,
    )
      .then(resolve => {
        itemData = resolve.data;
        return itemData;
      })
      .catch(e => {
        return ErrorParser.parse(e);
      });
    return resp;
  }
}
