/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { promisedComputed } from 'computed-async-mobx';
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/module/item/entity';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { EventUpdateViewProps, EventUpdateProps } from './types';
import EventItemModel from '@/store/models/EventItem';
import { getDurationTimeText } from '../helper';
import { accentColor } from '@/common/AccentColor';

class EventUpdateViewModel extends StoreViewModel<EventUpdateProps>
  implements EventUpdateViewProps {
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
  get event() {
    return getEntity<Item, EventItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get color() {
    return accentColor[this.event.color];
  }

  @computed
  get activityData() {
    return this.post.activityData || {};
  }

  getTimeText(value: any, event: EventItemModel) {
    const {
      repeat,
      repeatEndingAfter,
      repeatEnding,
      repeatEndingOn,
    } = this.event;
    return (
      (repeatEndingAfter &&
        getDurationTimeText(
          value.repeat || repeat,
          value.repeat_ending_after || repeatEndingAfter,
          value.repeat_ending_on || repeatEndingOn,
          value.repeat_ending || repeatEnding,
        )) ||
      ''
    );
  }

  oldTimeText = promisedComputed('', async () => {
    const { old_values } = this.activityData;
    return await this.getTimeText(old_values, this.event);
  });

  newTimeText = promisedComputed('', async () => {
    const { new_values } = this.activityData;
    return await this.getTimeText(new_values, this.event);
  });
}

export { EventUpdateViewModel };
