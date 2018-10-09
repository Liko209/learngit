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
  @observable id: number;
  @observable post: PostModel;
  @observable creator: PersonModel;
  private _postService: PostService;

  @action
  onReceiveProps(props: ConversationCardProps) {
    this.id = props.id;
    this.post = getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
    this.creator = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      this.post.creatorId,
    );
    this._postService = PostService.getInstance();
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
    await this._postService.reSendPost(this.id);
    // todo use Toast component display code 5000 error
  }

  delete = async () => {
    await this._postService.deletePost(this.id);
    // todo use Toast component display code 5000 error
  }
}

export { ConversationCardViewModel };
