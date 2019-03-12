/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-13 16:52:24
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/module/item/entity';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { TaskUpdateProps, TaskUpdateViewProps } from './types';
import TaskItemModel from '@/store/models/TaskItem';
import { accentColor } from '@/common/AccentColor';

class TaskUpdateViewModel extends StoreViewModel<TaskUpdateProps>
  implements TaskUpdateViewProps {
  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  private get _postId() {
    return this.props.postId;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._postId);
  }

  @computed
  get task() {
    return getEntity<Item, TaskItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get color() {
    return accentColor[this.task.color];
  }

  @computed
  get activityData() {
    return this.post.activityData || {};
  }
}

export { TaskUpdateViewModel };
