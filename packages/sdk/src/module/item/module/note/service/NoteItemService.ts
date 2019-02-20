/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:36
 * Copyright © RingCentral. All rights reserved.
 */

import { NoteItemController } from '../controller/NoteItemController';
import { NoteItem, SanitizedNoteItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';
import { NoteItemDao } from '../dao/NoteItemDao';
import { daoManager } from '../../../../../dao';

class NoteItemService extends BaseSubItemService<NoteItem, SanitizedNoteItem> {
  private _noteItemController: NoteItemController;

  constructor() {
    super(daoManager.getDao<NoteItemDao>(NoteItemDao));
  }

  protected get noteItemController() {
    if (!this._noteItemController) {
      this._noteItemController = new NoteItemController();
    }
    return this._noteItemController;
  }
}

export { NoteItemService };
