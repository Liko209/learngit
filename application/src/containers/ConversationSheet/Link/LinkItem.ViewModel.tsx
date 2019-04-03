/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import { ItemService } from 'sdk/module/item';
import LinkItemModel from '@/store/models/LinkItem';

class LinkItemViewModel extends StoreViewModel<{ ids: number[] }> {
  private _itemService: ItemService = ItemService.getInstance();
  // @observable private _ids: number[] = [];
  @computed
  private get _ids() {
    return this.props.ids;
  }
  @computed
  get postItems() {
    const items: LinkItemModel[] = [];
    this._ids.forEach((id: number) => {
      const item = getEntity<Item, LinkItemModel>(ENTITY_NAME.ITEM, id);
      if (item && !item.deactivated) {
        items.push(item);
      }
    });
    return items;
  }
  @action
  onLinkItemClose = async (itemId: number = 0) => {
    await this._itemService.doNotRenderItem(itemId, 'link');
  }
}
export { LinkItemViewModel };
