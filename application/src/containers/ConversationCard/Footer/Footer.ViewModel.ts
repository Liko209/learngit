/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { FooterProps, FooterViewProps } from './types';
import { PostService } from 'sdk/service';
import { Post } from 'sdk/models';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';

class FooterViewModel extends StoreViewModel<FooterProps>
  implements FooterViewProps {
  private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  private get _likes() {
    return this._post.likes;
  }

  @computed
  get likeCount() {
    return this._likes ? this._likes.length : 0;
  }

  @computed
  get isLike() {
    if (this._likes && this._likes.includes(this._currentUserId)) {
      return true;
    }
    return false;
  }

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  @action
  like = async (toLike: boolean) => {
    const postService = PostService.getInstance<PostService>();
    await postService.likePost(this._id, this._currentUserId, toLike);
  }
}

export { FooterViewModel };
