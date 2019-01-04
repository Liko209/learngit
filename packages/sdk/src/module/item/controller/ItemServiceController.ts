/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:21:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../module/base/service/ISubItemService';
import { SubItemServiceRegister } from '../config';
import { Item } from '../entity';

class ItemServiceController {
  private _subItemServices: Map<number, ISubItemService>;

  constructor() {
    this._subItemServices = SubItemServiceRegister.buildSubItemServices();
  }

  getSubItemService(typeId: number) {
    return this._subItemServices.get(typeId);
  }

  async getItems(
    typeId: number,
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ) {
    const subItemService = this.getSubItemService(typeId);
    if (subItemService) {
      subItemService.getSortedIds(groupId, limit, offset, sortKey, desc);
    }
  }

  async createItem(item: Item) {}

  async updateItem(item: Item) {}

  async deleteItem(itemId: number) {}
}

export { ItemServiceController };
