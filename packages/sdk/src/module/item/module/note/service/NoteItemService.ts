/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:36
 * Copyright © RingCentral. All rights reserved.
 */

import { SubItemService } from '../../base/service/SubItemService';
import { NoteItemController } from '../controller/NoteItemController';
class NoteItemService extends SubItemService {
  private _noteItemController: NoteItemController;

  constructor() {
    super();
  }

  protected get noteItemController() {
    if (!this._noteItemController) {
      this._noteItemController = new NoteItemController();
    }
    return this._noteItemController;
  }
}

export { NoteItemService };
