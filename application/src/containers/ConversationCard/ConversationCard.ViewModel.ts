/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-08 16:29:08
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import PostModel from '@/store/models/Post';
import {
  ConversationCardProps,
  ConversationCardViewProps,
} from '@/containers/ConversationCard/types';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { Post, Person } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import { StoreViewModel } from '@/store/ViewModel';
import { POST_STATUS } from 'sdk/service';
class ConversationCardViewModel extends StoreViewModel<ConversationCardProps>
  implements ConversationCardViewProps {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get hideText() {
    const { activityData } = this.post;
    return activityData && (activityData.object_id || activityData.key);
  }

  @computed
  get creator() {
    if (this.post.creatorId) {
      return getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        this.post.creatorId,
      );
    }
    return {} as PersonModel;
  }

  @computed
  get itemTypeIds() {
    return this.post.itemTypeIds || [];
  }

  @computed
  get showProgressActions() {
    return (
      this.post.status === POST_STATUS.INPROGRESS ||
      this.post.status === POST_STATUS.FAIL
    );
  }

  @computed
  get name() {
    return this.creator.displayName;
  }

  @computed
  get customStatus() {
    return this.creator.awayStatus;
  }

  @computed
  get createTime() {
    return moment(this.post.createdAt).format('hh:mm A');
  }
}

export { ConversationCardViewModel };
