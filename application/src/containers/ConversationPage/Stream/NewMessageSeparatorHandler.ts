/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { observable, computed } from 'mobx';
import { Post } from 'sdk/module/post/entity';
import { ISortableModel } from '@/store/base';
import { ISeparatorHandler } from './ISeparatorHandler';
import { NewSeparator, SeparatorType } from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';

class NewMessageSeparatorHandler implements ISeparatorHandler {
  priority = 2;
  private _readThrough?: number;
  private _disabled?: boolean;
  private _userId?: number;
  _oldestPost?: ISortableModel<Post>;

  @observable
  private _hasNewMessagesSeparator = false;

  @observable
  separatorMap = new Map<number, NewSeparator>();

  @observable
  firstUnreadPostId?: number;

  @computed
  get hasUnread() {
    return this._hasNewMessagesSeparator;
  }

  constructor() {
    this._userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  onAdded(
    direction: QUERY_DIRECTION,
    addedPosts: ISortableModel<Post>[],
    allPosts: ISortableModel<Post>[],
    hasMore: boolean,
  ): void {
    if (this._disabled) return;
    this._oldestPost = _.first(allPosts);

    /*
     * (1)
     * If the `New Messages` separator already existed,
     * it will never be modified when receive new posts
     */
    if (this.separatorMap.size > 0) return;

    /*
     * (2)
     * Check if there is a `New Messages` separator
     */
    const lastPost = _.last(allPosts);
    const readThrough = this._readThrough || 0;
    const hasSeparator = !!lastPost && lastPost.id > readThrough;
    this._hasNewMessagesSeparator = hasSeparator;

    // No separator
    if (!this._hasNewMessagesSeparator) return;

    /*
     * (3)
     * Check if separator in other page
     */
    const firstPost = this._oldestPost;
    const allPostsAreUnread = readThrough === 0;
    const hasSeparatorInOtherPage =
      (allPostsAreUnread && hasMore) ||
      (!allPostsAreUnread && firstPost && firstPost.id > readThrough);

    // Separator in other page, we'll handle it next
    // time when onAdded() was called
    if (hasSeparatorInOtherPage) return;

    /*
     * (4)
     * Separator in current page, let's find it now.
     */
    const firstUnreadPost = this._findNextOthersPost(allPosts, readThrough);
    if (firstUnreadPost) {
      this._setSeparator(firstUnreadPost.id);
    }
  }

  onDeleted(deletedPostIds: number[], allPosts: ISortableModel[]): void {
    const deletedPostWithSeparator = deletedPostIds.find(postId =>
      this.separatorMap.has(postId),
    );

    if (!deletedPostWithSeparator) return;

    this.separatorMap.delete(deletedPostWithSeparator);

    // Find first post next to the deleted post
    const postNext = _.find(
      allPosts,
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

  private _findNextOthersPost(
    allPosts: ISortableModel<Post>[],
    postId: number,
  ) {
    const len = allPosts.length;
    let targetPost;
    for (let i = 0; i < len; i++) {
      const post = allPosts[i];
      if (
        post.id > postId &&
        post.data &&
        post.data.creator_id !== this._userId
      ) {
        targetPost = post;
        break;
      }
    }
    return targetPost;
  }

  private _setSeparator(postId: number) {
    const separator: NewSeparator = {
      type: SeparatorType.NEW_MSG,
    };
    this.firstUnreadPostId = postId;
    this.separatorMap.set(postId, separator);
  }
}

export { NewMessageSeparatorHandler };
