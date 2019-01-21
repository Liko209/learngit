/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:21:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../module/base/service/ISubItemService';
import { SubItemServiceRegister } from '../config';
import { ItemActionController } from './ItemActionController';
import { buildPartialModifyController } from '../../../framework/controller';
import { Item } from '../entity';
import { daoManager } from '../../../dao';
import { ItemDao } from '../dao';
import { GlipTypeUtil } from '../../../utils';
import { IItemService } from '../service/IItemService';
import { ItemQueryOptions, ItemFilterFunction } from '../types';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';

class ItemServiceController {
  private _subItemServices: Map<number, ISubItemService>;
  private _itemActionController: ItemActionController;
  constructor(
    _itemService: IItemService,
    private _entitySourceController: IEntitySourceController<Item>,
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
      const partialModifyController = buildPartialModifyController<Item>(
        this._entitySourceController,
      );

      this._itemActionController = new ItemActionController(
        partialModifyController,
      );
    }
    return this._itemActionController;
  }

  async getGroupItemsCount(
    groupId: number,
    typeId: number,
    filterFunc?: ItemFilterFunction,
  ) {
    let totalCount = 0;
    const subItemService = this.getSubItemService(typeId);
    if (subItemService) {
      totalCount = await subItemService.getSubItemsCount(groupId, filterFunc);
    }
    return totalCount;
  }

  async getItems(options: ItemQueryOptions) {
    let ids: number[] = [];
    const subItemService = this.getSubItemService(options.typeId);
    if (subItemService) {
      ids = await subItemService.getSortedIds(options);
    }
    const itemDao = daoManager.getDao(ItemDao);
    const items = await itemDao.getItemsByIds(ids);

    const itemMap: Map<number, Item> = new Map();
    items.forEach((item: Item) => {
      itemMap.set(item.id, item);
    });

    return ids.map((id: number) => {
      return itemMap.get(id) as Item;
    });
  }

  async createItem(item: Item) {
    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.put(item);

    this._shouldSaveSanitizedItem(item) &&
      (await this._getSubItemServiceByITemId(item.id).createItem(item));
  }

  async updateItem(item: Item) {
    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.update(item);

    this._shouldSaveSanitizedItem(item) &&
      (await this._getSubItemServiceByITemId(item.id).updateItem(item));
  }

  async deleteItem(itemId: number) {
    await daoManager.getDao(ItemDao).delete(itemId);

    itemId > 0 &&
      (await this._getSubItemServiceByITemId(itemId).deleteItem(itemId));
  }

  private _getSubItemServiceByITemId(itemId: number) {
    const typeId = GlipTypeUtil.extractTypeId(itemId);
    return this.getSubItemService(typeId);
  }

  async handleSanitizedItems(incomingItems: Item[]) {
    const typeItemsMap: Map<number, Item[]> = new Map();
    incomingItems.forEach((item: Item) => {
      this._saveItemsToTypeIdMap(
        GlipTypeUtil.extractTypeId(item.id),
        typeItemsMap,
        item,
      );
    });

    typeItemsMap.forEach(
      (value: Item[], key: number, map: Map<number, Item[]>) => {
        this._updateSanitizedItems(key, value);
      },
    );
  }

  private _saveItemsToTypeIdMap(
    typeId: number,
    typeItemsMap: Map<number, Item[]>,
    item: Item,
  ) {
    typeItemsMap.has(typeId)
      ? (typeItemsMap.get(typeId) as Item[]).push(item)
      : typeItemsMap.set(typeId, [item]);
  }

  private async _updateSanitizedItems(typeId: number, items: Item[]) {
    const subItemService = this.getSubItemService(typeId);
    if (!subItemService) {
      return;
    }
    const deactivatedItems = items.filter(item => item.deactivated);
    deactivatedItems.forEach((item: Item) => {
      subItemService.deleteItem(item.id);
    });

    const normalData = items.filter(item => !item.deactivated);
    normalData.forEach((item: Item) => {
      subItemService.createItem(item);
    });
  }

  private _shouldSaveSanitizedItem(item: Item) {
    return item.id > 0 && item.post_ids && item.post_ids.length > 0;
  }
}

export { ItemServiceController };
