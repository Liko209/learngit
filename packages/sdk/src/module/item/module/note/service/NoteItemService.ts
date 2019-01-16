/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:36
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { NoteItemController } from '../controller/NoteItemController';
import { EntityBaseService } from '../../../../../framework/service';
import { IItemService } from '../../../service/IItemService';
import { ItemQueryOptions, ItemFilterFunction } from '../../../types';
import { NoteItem, SanitizedNoteItem } from '../entity';
import { NoteItemDao } from '../dao';
import { daoManager } from '../../../../../dao';
import { ItemUtils } from '../../../utils';

class NoteItemService extends EntityBaseService implements ISubItemService {
  private _noteItemController: NoteItemController;

  constructor(itemService: IItemService) {
    super();
  }

  protected get noteItemController() {
    if (!this._noteItemController) {
      this._noteItemController = new NoteItemController();
    }
    return this._noteItemController;
  }

  async updateItem(note: NoteItem) {
    const sanitizedDao = daoManager.getDao<NoteItemDao>(NoteItemDao);
    await sanitizedDao.update(this._toSanitizedNote(note));
  }

  async deleteItem(itemId: number) {
    const sanitizedDao = daoManager.getDao<NoteItemDao>(NoteItemDao);
    await sanitizedDao.delete(itemId);
  }

  async createItem(note: NoteItem) {
    const sanitizedDao = daoManager.getDao<NoteItemDao>(NoteItemDao);
    await sanitizedDao.put(this._toSanitizedNote(note));
  }

  private _toSanitizedNote(note: NoteItem) {
    return { ...ItemUtils.toSanitizedItem(note) } as SanitizedNoteItem;
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    const sanitizedDao = daoManager.getDao<NoteItemDao>(NoteItemDao);
    return await sanitizedDao.getSortedIds(options);
  }

  async getSubItemsCount(groupId: number, filterFunc: ItemFilterFunction) {
    const sanitizedDao = daoManager.getDao<NoteItemDao>(NoteItemDao);
    return await sanitizedDao.getGroupItemCount(groupId, filterFunc);
  }
}

export { NoteItemService };
