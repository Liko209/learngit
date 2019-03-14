import React, { ComponentType, ComponentClass } from 'react';
import { TWithPostLikeProps, TComponentWithLikeProps } from './types';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import { PostService } from 'sdk/module/post';
import { Post } from 'sdk/module/post/entity';
import { Person } from 'sdk/module/person/entity';
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
import { computed, action } from 'mobx';

function withPostLike<P>(
  Component: ComponentType<P & TComponentWithLikeProps>,
): ComponentClass<P & TWithPostLikeProps> {
  class ComponentWithPostLike extends React.Component<P & TWithPostLikeProps> {
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
    get LikedMembers() {
      const members = this._likes.reduce(
        (acc, id) =>
          this._checkedCurrentUser(id)
            ? acc
            : [...acc, this._composeMemberName(id)],
        [],
      );

      return this.iLiked ? ['You', ...members] : members;
    }

    @action
    onToggleLike = async (): Promise<void> => {
      const postService: PostService = PostService.getInstance();

      await postService.likePost(
        this.props.postId,
        this._currentUserId,
        !this.iLiked,
      );
    }

    private _checkedCurrentUser = (id: number): boolean => {
      return id === this._currentUserId;
    }

    private _composeMemberName = (id: number): string => {
      const { firstName, lastName } = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        id,
      );

      return `${firstName} ${lastName}`;
    }

    render() {
      const { postId, ...rest } = this.props;

      return (
        <Component
          iLiked={this.iLiked}
          likedMembers={this.LikedMembers}
          onToggleLike={this.onToggleLike}
          {...rest as P}
        />
      );
    }
  }

  return ComponentWithPostLike;
}

export { withPostLike };
