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
import PersonModel from '@/store/models/Person';
import { PostService } from 'sdk/service';
class ConversationCardViewModel extends AbstractViewModel
  implements ConversationCardViewProps {
  @observable private _id: number;
  private _postService: PostService = PostService.getInstance();

  @action
  onReceiveProps(props: ConversationCardProps) {
    if (this._id !== props.id) {
      this._id = props.id;
    }
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
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

  resend = async () => {
    await this._postService.reSendPost(this._id);
    // todo use Toast component display code 5000 error
  }

  delete = async () => {
    await this._postService.deletePost(this._id);
    // todo use Toast component display code 5000 error
  }
}

export { ConversationCardViewModel };
