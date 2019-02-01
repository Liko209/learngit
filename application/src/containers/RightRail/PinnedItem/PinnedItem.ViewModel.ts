/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:36
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { PinnedItemProps } from './types';
import { Item } from 'sdk/src/module/item/entity';
import ItemModel from '@/store/models/Item';

class PinnedItemViewModel extends AbstractViewModel<PinnedItemProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  get creator() {
    const { creatorId } = this.post;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId);
  }

  @computed
  get creatorName() {
    return this.creator.userDisplayName;
  }

  @computed
  get createTime() {
    return this.post.createdAt;
  }

  @computed
  get items() {
    return this.post.itemIds.map((id: number) =>
      getEntity<Item, ItemModel>(ENTITY_NAME.ITEM, id),
    );
  }
}

export { PinnedItemViewModel };
