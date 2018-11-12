/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ConversationPostProps,
  ConversationPostViewProps,
  PostType,
} from './types';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

const ActivityDataKeyMappingPostType = {
  set_abbreviation: 'notification',
  members: 'notification',
};

class ConversationPostViewModel extends AbstractViewModel<ConversationPostProps>
  implements ConversationPostViewProps {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get _activityData() {
    return this._post.activityData || {};
  }

  @computed
  get type(): PostType {
    const { key } = this._activityData;
    return ActivityDataKeyMappingPostType[key] || 'post';
  }
}

export { ConversationPostViewModel };
