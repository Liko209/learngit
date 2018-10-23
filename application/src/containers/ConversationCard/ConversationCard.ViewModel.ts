/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-10-08 16:29:08
* Copyright © RingCentral. All rights reserved.
*/
import moment from 'moment';
import PostModel from '@/store/models/Post';
import { AbstractViewModel } from '@/base';
import {
  ConversationCardProps,
  ConversationCardViewProps,
} from '@/containers/ConversationCard/types';
import { observable, action, computed } from 'mobx';
import { getEntity, getGlobalValue } from '@/store/utils';
import { Post, Person } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';

class ConversationCardViewModel extends AbstractViewModel implements ConversationCardViewProps {
  @observable id: number;

  @action
  onReceiveProps(props: ConversationCardProps) {
    if (this.id !== props.id) {
      this.id = props.id;
    }
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get creator() {
    return getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      this.post.creatorId,
    );
  }

  @computed
  get displayTitle() {
    let str = this.creator.displayName;
    if (this.creator.awayStatus) {
      str += ` ${this.creator.awayStatus}`;
    }

    return str;
  }

  @computed
  get createTime() {
    return moment(this.post.createdAt).format('hh:mm A');
  }
  @computed
  get kv() {
    const post = this.post;
    const atMentionNonItemIds = post && post.atMentionNonItemIds || [];
    const kv = {};
    atMentionNonItemIds.forEach((personId: number) => {
      kv[personId] = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        personId,
      ).displayName;
    });
    return kv;
  }
  @computed
  get currentUserId() {
    return getGlobalValue('currentUserId');
  }
}

export { ConversationCardViewModel };
