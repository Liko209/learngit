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
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

class TaskUpdateViewModel extends StoreViewModel<TaskUpdateProps> implements TaskUpdateViewProps {
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

  filterEffectiveIds(ids: number[]) {
    if (!ids) {
      return [];
    }

    return ids
      .map((assignedId: number) => {
        const person = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, assignedId);
        if (person.isMocked) {
          return null;
        }
        return assignedId;
      })
      .filter((item: null | number) => item !== null);
  }

  @computed
  get effectiveIds() {
    const { assignedToIds } = this.task;
    return this.filterEffectiveIds(assignedToIds);
  }

  @computed
  get color() {
    return accentColor[this.task.color];
  }

  @computed
  get activityData() {
    if (!this.post.activityData) {
      return {};
    }

    const { value, old_value, key } = this.post.activityData;

    if (key === 'complete_people_ids') {
      return {
        ...this.post.activityData,
        value: value ? this.filterEffectiveIds(value) : [],
      };
    }

    if (key === 'assigned_to_ids') {
      return {
        ...this.post.activityData,
        value: value ? this.filterEffectiveIds(value) : [],
        old_value: old_value ? this.filterEffectiveIds(old_value) : [],
      };
    }
    return this.post.activityData;
  }
}

export { TaskUpdateViewModel };
