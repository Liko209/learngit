/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ActionsProps } from './types';
import { getEntity } from '@/store/utils';
import { Post } from 'sdk/module/post/entity';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
class ActionsViewModel extends StoreViewModel<ActionsProps> {
  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.postId);
  }

  @computed
  get isIntegration() {
    return !!this.post.icon;
  }
}

export { ActionsViewModel };
