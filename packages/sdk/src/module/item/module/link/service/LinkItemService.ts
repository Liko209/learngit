/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:59
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { LinkItemController } from '../controller/LinkItemController';
import { EntityBaseService } from '../../../../../framework/service';
import { Item } from '../../../entity';
import { IItemService } from '../../../service/IItemService';

class LinkItemService extends EntityBaseService implements ISubItemService {
  private _linkItemController: LinkItemController;

  constructor(itemService: IItemService) {
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
    offsetItemId: number,
    sortKey: string,
    desc: boolean,
  ): Promise<number[]> {
    return Promise.resolve([]);
  }

  updateItem(item: Item) {}

  createItem(item: Item) {}

  deleteItem(itemId: number) {}

  async getSubItemsCount(groupId: number) {
    return 0;
  }
}

export { LinkItemService };
