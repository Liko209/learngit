/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/module/item/entity';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { EventUpdateViewProps, EventUpdateProps } from './types';
import EventItemModel from '@/store/models/EventItem';

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
    return getEntity<Item, EventItemModel>(ENTITY_NAME.EVENT_ITEM, this._id);
  }

  @computed
  get activityData() {
    return this.post.activityData || {};
  }
}

export { EventUpdateViewModel };
