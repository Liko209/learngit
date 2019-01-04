/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { ItemServiceController } from '../controller/ItemServiceController';

class ItemService extends EntityBaseService<Item> {
  private _itemServiceController: ItemServiceController;
  constructor() {
    super();
  }

  protected get itemServiceController() {
    if (!this._itemServiceController) {
      this._itemServiceController = new ItemServiceController();
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
}

export { ItemService };
