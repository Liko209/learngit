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
  @observable ids: number[];
  constructor(props: { ids: number[] }) {
    super(props);
    this.ids = props.ids;
  }
  @computed
  get postItems() {
    return this.ids.map((item) => {
      return getEntity<Item, ItemModel>(ENTITY_NAME.ITEM, item);
    });
  }
  @action
  onLinkItemClick = (id: number) => {
    this._itemService.deleteItem(id);
    const index = this.ids.indexOf(id);
    index !== -1 ? this.ids.splice(index, 1) : null;
  }
}
export { LinkItemViewModel };
