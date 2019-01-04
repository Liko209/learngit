/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:21:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../module/base/service/ISubItemService';
import { SubItemServiceRegister } from '../config';
import { ItemActionController } from './ItemActionController';
import { IControllerBuilder } from '../../../framework/controller/interface/IControllerBuilder';
import { Item } from '../entity';
import { Api } from '../../../api';
import { daoManager, ItemDao } from '../../../dao';

class ItemServiceController {
  private _subItemServices: Map<number, ISubItemService>;
  private _itemActionController: ItemActionController;
  constructor(private _controllerBuilder: IControllerBuilder<Item>) {
    this._subItemServices = SubItemServiceRegister.buildSubItemServices();
  }

  getSubItemService(typeId: number) {
    return this._subItemServices.get(typeId) as ISubItemService;
  }

  get itemActionController() {
    if (!this._itemActionController) {
      const requestController = this._controllerBuilder.buildRequestController({
        basePath: '/item',
        networkClient: Api.glipNetworkClient,
      });

      const entitySourceController = this._controllerBuilder.buildEntitySourceController(
        daoManager.getDao(ItemDao),
        requestController,
      );

      const partialModifyController = this._controllerBuilder.buildPartialModifyController(
        entitySourceController,
      );

      this._itemActionController = new ItemActionController(
        partialModifyController,
      );
    }
    return this._itemActionController;
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
