/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-29 16:12:44
 * Copyright © RingCentral. All rights reserved.
 */
import { IFetchSortableDataProvider, ISortableModel } from '@/store/base/fetch';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ItemService, ITEM_SORT_KEYS } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

class GroupItemDataProvider implements IFetchSortableDataProvider<Item> {
  constructor(
    private _groupId: number,
    private _typeId: number,
    private _sortKey: ITEM_SORT_KEYS,
    private _desc: boolean,
    private _filterFunc: ((value: any, index?: number) => boolean) | undefined,
  ) {}
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<Item>,
  ): Promise<{
    data: Item[];
    hasMore: boolean;
  }> {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const result = await itemService.getItems({
      typeId: this._typeId,
      groupId: this._groupId,
      sortKey: this._sortKey,
      desc: this._desc,
      limit: pageSize,
      offsetItemId: anchor && anchor.id,
      filterFunc: this._filterFunc,
    });
    return { data: result, hasMore: result.length === pageSize };
  }
}

export { GroupItemDataProvider };
