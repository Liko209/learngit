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
import { ENTITY, SOCKET } from '../eventKey';
import notificationCenter from '../notificationCenter';
import { ErrorParser } from '../../utils/error';

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
  async doNotRenderLink(id: number, type: string): Promise<boolean> {
    const itemDao = daoManager.getDao(ItemDao);
    const item = (await itemDao.get(id)) as Item;
    if (item) {
      item.do_not_render = true;
      notificationCenter.emitEntityUpdate(ENTITY.ITEM, [item]);
      item._id = item.id;
      delete item.id;
      try {
        const resp = await ItemAPI.putItem<Item>(id, type, item);
        if (resp && resp.data) {
          return true;
        }
      } catch (e) {
        item._id = item.id;
        delete item.id;
        item.do_not_render = false;
        notificationCenter.emitEntityUpdate(ENTITY.ITEM, [item]);
        throw ErrorParser.parse(e);
      }
    }
    return false;
  }
}
