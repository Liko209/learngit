/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:21:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../module/base/service/ISubItemService';
import { SubItemServiceRegister } from '../config';
import { ItemActionController } from './ItemActionController';
import { ControllerBuilder } from '../../../framework/controller/impl/ControllerBuilder';
import { Item } from '../entity';
import { Api } from '../../../api';
import { daoManager, ItemDao } from '../../../dao';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { IItemService } from '../service/IItemService';

class ItemServiceController {
  private _subItemServices: Map<number, ISubItemService>;
  private _itemActionController: ItemActionController;
  constructor(
    _itemService: IItemService,
    private _controllerBuilder: ControllerBuilder<Item>,
  ) {
    this._subItemServices = SubItemServiceRegister.buildSubItemServices(
      _itemService,
    );
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

  async getGroupItemsCount(groupId: number, typeId: number) {
    let totalCount = 0;
    const subItemService = this.getSubItemService(typeId);
    if (subItemService) {
      totalCount = await subItemService.getSubItemsCount(groupId);
    }
    return totalCount;
  }

  async getItems(
    typeId: number,
    groupId: number,
    limit: number,
    offsetItemId: number,
    sortKey: string,
    desc: boolean,
  ) {
    let ids: number[] = [];
    const subItemService = this.getSubItemService(typeId);
    if (subItemService) {
      ids = await subItemService.getSortedIds(
        groupId,
        limit,
        offsetItemId,
        sortKey,
        desc,
      );
    }
    const itemDao = daoManager.getDao(ItemDao);
    return await itemDao.getItemsByIds(ids);
  }

  async createItem(item: Item) {
    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.put(item);

    if (item.id > 0) {
      const typeId = GlipTypeUtil.extractTypeId(item.id);
      await this.getSubItemService(typeId).createItem(item);
    }
  }

  async updateItem(item: Item) {
    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.update(item);

    if (item.id > 0) {
      const typeId = GlipTypeUtil.extractTypeId(item.id);
      await this.getSubItemService(typeId).updateItem(item);
    }
  }

  async deleteItem(itemId: number) {
    await daoManager.getDao(ItemDao).delete(itemId);
    const typeId = GlipTypeUtil.extractTypeId(itemId);

    if (itemId > 0) {
      await this.getSubItemService(typeId).deleteItem(itemId);
    }
  }

  async handleSanitizedItems(incomingItems: Item[]) {
    const typeItemsMap: Map<number, Item[]> = new Map();
    incomingItems.forEach((item: Item) => {
      const type = GlipTypeUtil.extractTypeId(item.id);
      switch (type) {
        case TypeDictionary.TYPE_ID_FILE:
          typeItemsMap.has(TypeDictionary.TYPE_ID_FILE)
            ? (typeItemsMap.get(TypeDictionary.TYPE_ID_FILE) as Item[]).push(
                item,
              )
            : typeItemsMap.set(TypeDictionary.TYPE_ID_FILE, [item]);
          break;
        default:
          break;
      }
    });

    typeItemsMap.forEach(
      (value: Item[], key: number, map: Map<number, Item[]>) => {
        this._updateSanitizedItems(key, value);
      },
    );
  }

  private async _updateSanitizedItems(typeId: number, items: Item[]) {
    const subItemService = this.getSubItemService(typeId);
    const deactivatedItems = items.filter(item => item.deactivated);
    deactivatedItems.forEach((item: Item) => {
      subItemService.deleteItem(item.id);
    });

    const normalData = items.filter(item => !item.deactivated);
    normalData.forEach((item: Item) => {
      subItemService.createItem(item);
    });
  }
}

export { ItemServiceController };
