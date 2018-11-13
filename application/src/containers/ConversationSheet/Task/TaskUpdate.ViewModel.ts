/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-13 16:52:24
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item, Post } from 'sdk/models';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { TaskUpdateViewProps } from './types';
import { TaskItem } from '@/store/models/Items';

class TaskUpdateViewModel extends StoreViewModel<TaskUpdateViewProps> {
  @computed
  get _id() {
    return this.props.ids[0];
  }

  @computed
  get _postId() {
    return this.props.postId;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._postId);
  }

  @computed
  get task() {
    return getEntity<Item, TaskItem>(ENTITY_NAME.ITEM, this._id);
  }
}

export { TaskUpdateViewModel };
