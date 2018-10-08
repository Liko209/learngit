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
import { getEntity } from '@/store/utils';
import { Post, Person } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import { service } from 'sdk';
import PersonModel from '@/store/models/Person';
class ConversationCardViewModel extends AbstractViewModel
  implements ConversationCardViewProps {
  @observable
  id: number;
  @observable
  post: PostModel;
  @observable
  creator: PersonModel;

  _postService: service.PostService;

  @action
  onReceiveProps(props: ConversationCardProps) {
    this.id = props.id;
    this.post = getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
    this.creator = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      this.post.creatorId,
    );
    this.resend = this.resend.bind(this);
    this.delete = this.delete.bind(this);
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

  async resend() {
    try {
      await this._postService.reSendPost(this.id);
    } catch (e) {
      // todo use Toast component display code 5000 error
    }
  }

  async delete() {
    try {
      await this._postService.deletePost(this.id);
    } catch (e) {
      // todo use Toast component display code 5000 error
    }
  }
}

export { ConversationCardViewModel };
