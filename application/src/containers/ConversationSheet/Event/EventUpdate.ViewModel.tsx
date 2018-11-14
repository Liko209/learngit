/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item, Post } from 'sdk/models';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { EventUpdateViewProps, EventUpdateProps } from './types';
import { EventItem } from '@/store/models/Items';

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
    return getEntity<Item, EventItem>(ENTITY_NAME.ITEM, this._id);
  }
}

export { EventUpdateViewModel };
