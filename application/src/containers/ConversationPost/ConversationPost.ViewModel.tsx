/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ConversationPostProps, POST_TYPE } from './types';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity';
import { ENTITY_NAME } from '@/store';

const ActivityDataKeyMappingPostType = {
  set_abbreviation: POST_TYPE.NOTIFICATION,
  members: POST_TYPE.NOTIFICATION,
};

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
  get type(): POST_TYPE {
    const { key } = this._activityData;
    return ActivityDataKeyMappingPostType[key] || POST_TYPE.POST;
  }
}

export { ConversationPostViewModel };
