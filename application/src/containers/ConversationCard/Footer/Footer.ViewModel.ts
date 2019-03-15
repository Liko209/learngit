/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { FooterProps } from './types';
import { WithPostLikeProps } from './withPostLike/types';
import { Post } from 'sdk/module/post/entity';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';

class FooterViewModel extends StoreViewModel<FooterProps>
  implements WithPostLikeProps {
  @computed
  get postId() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.postId);
  }

  @computed
  private get _likes() {
    return this._post.likes;
  }

  @computed
  get likeCount() {
    return this._likes ? this._likes.length : 0;
  }
}

export { FooterViewModel };
