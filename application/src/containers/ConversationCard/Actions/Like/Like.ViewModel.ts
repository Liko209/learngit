/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { LikeProps, LikeViewProps } from './types';
import { PostService } from 'sdk/service';
import { Post } from 'sdk/models';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import { Notification } from '../Notification';

class LikeViewModel extends StoreViewModel<LikeProps> implements LikeViewProps {
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
  get isLike() {
    const likes = this._post.likes;
    return !!likes && likes.includes(this._currentUserId);
  }

  @action
  like = async (toLike: boolean) => {
    const postService = PostService.getInstance<PostService>();
    const result = await postService.likePost(
      this._id,
      this._currentUserId,
      toLike,
    );
    if (result.isErr()) {
      const message = toLike
        ? 'SorryWeEreNotAbleToLikeTheMessage'
        : 'SorryWeEreNotAbleToUnlikeTheMessage';
      Notification.flashToast({
        message,
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
        dismissible: false,
      });
    }
  }
}

export { LikeViewModel };
