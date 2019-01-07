/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:59
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { LinkItemController } from '../controller/LinkItemController';
import { EntityBaseService } from '../../../../../framework/service';
import { Item } from '../../../entity';

class LinkItemService extends EntityBaseService implements ISubItemService {
  private _linkItemController: LinkItemController;

  constructor() {
    super();
  }

  protected get linkItemController() {
    if (!this._linkItemController) {
      this._linkItemController = new LinkItemController();
    }
    return this._linkItemController;
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

  updateItem(item: Item) {}

  createItem(item: Item) {}

  deleteItem(itemId: number) {}
}

export { LinkItemService };
