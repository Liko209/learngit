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
import { IItemService } from '../service/IItemService';
import { ItemQueryOptions, ItemFilterFunction } from '../types';
import { ItemSyncController } from './ItemSyncController';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';

class ItemServiceController {
  private _subItemServices: Map<number, ISubItemService>;
  private _itemActionController: ItemActionController;
  private _itemSyncController: ItemSyncController;

  constructor(
    private _itemService: IItemService,
    private _entitySourceController: IEntitySourceController<Item>,
  ) {
    this._subItemServices = SubItemServiceRegister.buildSubItemServices();
  }

  getSubItemService(typeId: number) {
    return this._subItemServices.get(typeId) as ISubItemService;
  }

  get itemSyncController() {
    if (!this._itemSyncController) {
      this._itemSyncController = new ItemSyncController(this._itemService);
    }

    return this._itemSyncController;
  }

  get itemActionController() {
    if (!this._itemActionController) {
      const partialModifyController = buildPartialModifyController<Item>(
        this._entitySourceController,
      );

      this._itemActionController = new ItemActionController(
        partialModifyController,
        this._entitySourceController,
        this._itemService,
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
    const ids: number[] = await this._getSortedItemIds(options);
    if (ids.length === 0) {
      return [];
    }

    return await this._entitySourceController.batchGet(ids, true);
  }

  async getItemIndexInfo(
    itemId: number,
    options: ItemQueryOptions,
  ): Promise<{ index: number; totalCount: number }> {
    const itemIds = await this._getSortedItemIds(options);
    return { index: itemIds.indexOf(itemId), totalCount: itemIds.length };
  }

  private async _getSortedItemIds(options: ItemQueryOptions) {
    let ids: number[] = [];
    const subItemService = this.getSubItemService(options.typeId);
    if (subItemService) {
      ids = await subItemService.getSortedIds(options);
    }
    return ids;
  }
}

export { ItemServiceController };
