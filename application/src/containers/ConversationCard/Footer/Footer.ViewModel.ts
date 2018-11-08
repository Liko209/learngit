/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { FooterProps, FooterViewProps, ERROR_TYPE } from './types';
import { PostService } from 'sdk/service';
import { Post } from 'sdk/models';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';

class FooterViewModel extends StoreViewModel<FooterProps>
  implements FooterViewProps {
  currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

  @computed
  get _id() {
    return this.props.id;
  }

  @observable
  errType: ERROR_TYPE;

  @observable
  hasError: boolean = false;

  @computed
  get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  get _likes() {
    return this._post.likes;
  }

  @computed
  get likeCount() {
    return this._likes ? this._likes.length : 0;
  }

  @computed
  get isLike() {
    if (this._likes && this._likes.includes(this.currentUserId)) {
      return true;
    }
    return false;
  }

  @computed
  get _isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  @action
  like = () => {
    const postService = PostService.getInstance<PostService>();
    try {
      postService.likePost(this._id, this.currentUserId, true);
    } catch {
      this.errType = this._isOffline ? ERROR_TYPE.NETWORK : ERROR_TYPE.LIKE;
      this.hasError = true;
    }
  }

  @action
  unlike = () => {
    const postService = PostService.getInstance<PostService>();
    try {
      postService.likePost(this._id, this.currentUserId, false);
    } catch {
      this.errType = this._isOffline ? ERROR_TYPE.NETWORK : ERROR_TYPE.UNLIKE;
      this.hasError = true;
    }
  }
}

export { FooterViewModel };
