/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ConversationPostProps } from './types';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity';
import { ENTITY_NAME } from '@/store';
import { getPostType, POST_TYPE } from '@/common/getPostType';

class ConversationPostViewModel extends AbstractViewModel<
  ConversationPostProps
> {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  private get _activityData() {
    return this._post.activityData || {};
  }

  @computed
  get conversationId() {
    return this._post.groupId;
  }

  @computed
  get type(): POST_TYPE {
    const { key } = this._activityData;
    return getPostType(key);
  }
}

export { ConversationPostViewModel };
