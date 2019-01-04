/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:36
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { NoteItemController } from '../controller/NoteItemController';
import { EntityBaseService } from '../../../../../framework/service';
class NoteItemService extends EntityBaseService implements ISubItemService {
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

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }

  updateItem(): void {}
}

export { NoteItemService };
