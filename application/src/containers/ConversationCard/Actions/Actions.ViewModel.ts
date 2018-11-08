/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ActionsProps, ActionsViewProps, ERROR_TYPE } from './types';
import { PostService } from 'sdk/service';
import { Post, Profile } from 'sdk/models';
import { getGlobalValue, getSingleEntity, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import ProfileModel from '@/store/models/Profile';

class ActionsViewModel extends StoreViewModel<ActionsProps>
  implements ActionsViewProps {
  currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

  @computed
  get _id() {
    return this.props.id;
  }

  @observable
  errType: ERROR_TYPE;

  @observable
  hasError: boolean = false;

  @observable
  tKey: string;

  @computed
  get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  get _favoritePostIds() {
    return getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'favoritePostIds',
    );
  }

  @computed
  get _isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  @computed
  get isLike() {
    const likes = this._post.likes;
    if (likes && likes.includes(this.currentUserId)) {
      return true;
    }
    return false;
  }

  @computed
  get isBookmark() {
    return this._favoritePostIds.includes(this._id);
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

  @action
  bookmark = () => {
    const postService = PostService.getInstance<PostService>();
    try {
      postService.bookmarkPost(this._id, true);
    } catch {
      this.errType = this._isOffline ? ERROR_TYPE.NETWORK : ERROR_TYPE.BOOKMARK;
      this.hasError = true;
    }
  }

  @action
  removeBookmark = () => {
    const postService = PostService.getInstance<PostService>();
    try {
      postService.bookmarkPost(this._id, false);
    } catch {
      this.errType = this._isOffline
        ? ERROR_TYPE.NETWORK
        : ERROR_TYPE.REMOVE_BOOKMARK;
      this.hasError = true;
    }
  }
}

export { ActionsViewModel };
