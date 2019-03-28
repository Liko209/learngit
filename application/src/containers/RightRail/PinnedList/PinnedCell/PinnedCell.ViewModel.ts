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
import { PinnedCellProps } from './types';
import { dateFormatter } from '@/utils/date';

class PinnedCellViewModel extends AbstractViewModel<PinnedCellProps> {
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
    if (creatorId) {
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId);
    }
    return null;
  }

  @computed
  get creatorName() {
    const creator = this.creator;
    if (creator) {
      return creator.userDisplayName;
    }
    return '';
  }

  @computed
  get textContent() {
    return this.post.text && this.post.text.replace(/<[^>]+>/gi, '');
  }

  @computed
  get createTime() {
    const { createdAt } = this.post;
    if (createdAt) {
      return dateFormatter.date(createdAt);
    }
    return '';
  }

  @computed
  get itemIds() {
    return this.post.itemIds || [];
  }
}

export { PinnedCellViewModel };
