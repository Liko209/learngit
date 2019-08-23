/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { Item } from 'sdk/module/item/entity';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';
import { ItemService } from 'sdk/module/item';
import { LinkItemModel, LinkItemProps } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GLOBAL_KEYS } from '@/store/constants';
import { UserSettingEntity, SettingEntityIds } from 'sdk/module/setting';
import SettingModel from '@/store/models/UserSetting';

class LinkItemViewModel extends StoreViewModel<LinkItemProps> {
  private _itemService = ServiceLoader.getInstance<ItemService>(
    ServiceConfig.ITEM_SERVICE,
  );

  @computed
  private get _ids() {
    return this.props.ids;
  }

  @computed
  get isLinkPreviewDisabled() {
    return !getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      SettingEntityIds.Link_Preview,
    ).value;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.postId);
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
  };
  @computed
  get canClosePreview() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    if (this.postItems.length) {
      return this.postItems[0].creatorId === currentUserId;
    }
    return false;
  }
}
export { LinkItemViewModel };
