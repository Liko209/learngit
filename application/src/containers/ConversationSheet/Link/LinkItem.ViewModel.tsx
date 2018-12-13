/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { Item } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import { ItemService } from 'sdk/service';
import { LinkItem } from '@/store/models/Items';

class LinkItemViewModel extends StoreViewModel<{ ids: number[] }> {
  private _itemService: ItemService = ItemService.getInstance();
  // @observable private _ids: number[] = [];
  @computed
  private get _ids() {
    return this.props.ids;
  }
  @computed
  get postItems() {
    return this._ids.map((item) => {
      return getEntity<Item, LinkItem>(ENTITY_NAME.ITEM, item);
    });
  }
  @action
  onLinkItemClose = async (itemId: number = 0) => {
    await this._itemService.doNotRenderItem(itemId, 'link');
  }
}
export { LinkItemViewModel };
