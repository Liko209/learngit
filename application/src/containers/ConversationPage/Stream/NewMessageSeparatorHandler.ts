/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { observable } from 'mobx';
import { Post } from 'sdk/src/models';
import { FetchDataDirection, ISortableModel } from '@/store/base';
import { ISeparatorHandler } from './ISeparatorHandler';
import { NewSeparator, SeparatorType } from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';

class NewMessageSeparatorHandler implements ISeparatorHandler {
  priority = 2;
  private _readThrough?: number;
  private _disabled?: boolean;
  private _userId?: number;
  private _hasNewMessagesSeparator = false;

  @observable
  separatorMap = new Map<number, NewSeparator>();

  constructor() {
    this._userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  onAdded(
    direction: FetchDataDirection,
    addedPosts: ISortableModel<Post>[],
    allPosts: ISortableModel<Post>[],
  ): void {
    if (this._disabled) return;

    // If no readThrough, it means no unread posts.
    if (!this._readThrough) return;
    const readThrough = this._readThrough;

    // If the `New Messages` separator already existed,
    // it will never be modified when receive new posts
    if (this.separatorMap.size > 0) return;

    const lastPost = _.last(allPosts);

    if (lastPost) {
      this._hasNewMessagesSeparator = lastPost.id !== this._readThrough;
    }

    const firstUnreadPost = this._findNextOthersPost(allPosts, readThrough);

    if (firstUnreadPost) {
      // readThrough post in current page
      this._setSeparator(firstUnreadPost.id);
    } else {
      // readThrough post in the next page
    }
  }

  onDeleted(deletedPostIds: number[], allPosts: ISortableModel[]): void {
    const deletedPostWithSeparator = deletedPostIds.find(postId =>
      this.separatorMap.has(postId),
    );

    if (!deletedPostWithSeparator) return;

    this.separatorMap.delete(deletedPostWithSeparator);

    // Find first post next to the deleted post that has separator
    const postNext = _.find(
      this._getOtherUsersPosts(allPosts),
      ({ id }) => id > deletedPostWithSeparator,
    );

    // The deleted one is the last post
    if (!postNext) return;

    this._setSeparator(postNext.id);
  }

  setReadThroughIfNoSeparator(readThrough?: number) {
    if (this._hasNewMessagesSeparator) return;

    this._readThrough = readThrough;
  }

  /**
   * When the user received a new post, and the user is at the
   * bottom of stream, we should not add `New Messages` separator.
   */
  disable() {
    this._disabled = true;
  }

  /**
   * When the user scrolled up to read history posts, new received
   * new posts should be
   */
  enable() {
    this._disabled = false;
  }

  private _getOtherUsersPosts(allPosts: ISortableModel<Post>[]) {
    return allPosts.filter(
      item => item && item.data && item.data.creator_id !== this._userId,
    );
  }

  private _findNextOthersPost(
    allPosts: ISortableModel<Post>[],
    postId: number,
  ) {
    const targetPost = allPosts.find(post => post.id === postId);
    if (!targetPost) return;

    const nextPost = allPosts.find(
      post =>
        !!(
          post.id > targetPost.id &&
          post.data &&
          post.data.creator_id !== this._userId
        ),
    );

    if (!nextPost) return;

    return nextPost;
  }

  private _setSeparator(postId: number) {
    const separator: NewSeparator = {
      type: SeparatorType.NEW_MSG,
    };
    this.separatorMap.set(postId, separator);
  }
}

export { NewMessageSeparatorHandler };
