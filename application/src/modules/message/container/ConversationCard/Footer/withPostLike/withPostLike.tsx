/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-14 19:00:00,
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType, ComponentClass } from 'react';
import { WithPostLikeProps, WithPostLikeComponentProps } from './types';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import { PostService } from 'sdk/module/post';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { computed, action } from 'mobx';
import { observer } from 'mobx-react';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';

function withPostLike<P>(
  Component: ComponentType<P & WithPostLikeComponentProps>,
): ComponentClass<P & WithPostLikeProps> {
  @observer
  class ComponentWithPostLike extends React.Component<P & WithPostLikeProps> {
    private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    @computed
    private get _post() {
      return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.postId);
    }

    @computed
    private get _likes() {
      const { likes } = this._post;

      return likes || [];
    }

    @computed
    get iLiked() {
      return this._likes.includes(this._currentUserId);
    }

    @computed
    get likedUsers(): PersonModel[] {
      const handler = (id: number) => getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);

      return this._likes.map(handler);
    }

    @action
    _handleToggle = async (): Promise<void> => {
      const postService = ServiceLoader.getInstance<PostService>(
        ServiceConfig.POST_SERVICE,
      );

      await postService.likePost(
        this.props.postId,
        this._currentUserId,
        !this.iLiked,
      );
    }

    @catchError.flash({
      network: 'message.prompt.notAbleToUnlikeForNetworkIssue',
      server: 'message.prompt.notAbleToUnlikeForServerIssue',
    })
    private handleUnlike = () => this._handleToggle()

    @catchError.flash({
      network: 'message.prompt.notAbleToLikeThisMessageForNetworkIssue',
      server: 'message.prompt.notAbleToLikeThisMessageForServerIssue',
    })
    private handleLike = () => this._handleToggle()

    render() {
      const { postId, ...rest } = this.props;

      return (
        <Component
          iLiked={this.iLiked}
          likedUsers={this.likedUsers}
          onToggleLike={this.iLiked ? this.handleUnlike : this.handleLike}
          {...rest as P}
        />
      );
    }
  }

  return ComponentWithPostLike;
}

export { withPostLike };
