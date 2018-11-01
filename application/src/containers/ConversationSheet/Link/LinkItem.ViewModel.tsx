/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import ItemModel from '@/store/models/Item';
import { getEntity } from '@/store/utils';
import { Item } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import { ItemService } from 'sdk/service';

class LinkItemViewModel extends StoreViewModel<{ ids: number[] }> {
  private _itemService: ItemService = ItemService.getInstance();
  @observable private _ids: number[] = [];
  constructor(props: { ids: number[] }) {
    super(props);
    this._ids = props.ids;
  }
  @computed
  get postItems() {
    return this._ids.map((item) => {
      return getEntity<Item, ItemModel>(ENTITY_NAME.ITEM, item);
    });
  }
  @action
  onLinkItemClick = async (itemId: number) => {
    await this._itemService.deleteItem(itemId);
    const idIndex = this._ids.indexOf(itemId);
    if (idIndex > -1) {
      this._ids.splice(idIndex, 1);
    }
  }
}
export { LinkItemViewModel };
