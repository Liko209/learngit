/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ActionsProps, ActionsViewProps } from './types';
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
  get isOffline() {
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
  like = async () => {
    const postService = PostService.getInstance<PostService>();
    await postService.likePost(this._id, this.currentUserId, true);
  }

  @action
  unlike = async () => {
    const postService = PostService.getInstance<PostService>();
    await postService.likePost(this._id, this.currentUserId, false);
  }

  @action
  bookmark = async () => {
    const postService = PostService.getInstance<PostService>();
    await postService.bookmarkPost(this._id, true);
  }

  @action
  removeBookmark = async () => {
    const postService = PostService.getInstance<PostService>();
    await postService.bookmarkPost(this._id, false);
  }
}

export { ActionsViewModel };
