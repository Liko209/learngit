/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { observable, computed } from 'mobx';
import { Post } from 'sdk/module/post/entity';
import { ISortableModel } from '@/store/base';

import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';

import { StreamItemType } from '../../types';
import { Assembler } from './Assembler';
import {
  AssemblerAddFuncArgs,
  AssemblerAddFunc,
  AssemblerDelFuncArgs,
  AssemblerDelFunc,
} from './types';

class NewMessageSeparatorHandler extends Assembler {
  private _readThrough: number = 0;
  private _disabled?: boolean;
  private _userId?: number;
  private separatorId?: number;
  _oldestPost?: ISortableModel<Post>;

  @observable
  private _hasNewMessagesSeparator = false;

  @observable
  firstUnreadPostId?: number;

  @computed
  get hasUnread() {
    return this._hasNewMessagesSeparator;
  }

  constructor() {
    super();
    this._userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  onAdd: AssemblerAddFunc = (args: AssemblerAddFuncArgs) => {
    const { postList, hasMore, newItems, readThrough } = args;
    this.updateReadThrough(readThrough);
    args.readThrough = this._readThrough;
    if (this._disabled) return args;
    this._oldestPost = _.first(postList);
    /*
     * (1)
     * If the `New Messages` separator already existed,
     * it will never be modified when receive new posts
     */
    if (this.separatorId) return args;

    /*
     * (2)
     * Check if there should be a `New Messages` separator
     */
    const lastPost = _.last(postList);
    const hasSeparator = !!lastPost && lastPost.id > this._readThrough;
    this._hasNewMessagesSeparator = hasSeparator;

    // No separator
    if (!this._hasNewMessagesSeparator) return args;

    /*
     * (3)
     * Check if separator in other page
     */
    const firstPost = this._oldestPost;
    const allPostsAreUnread = this._readThrough === 0;
    const hasSeparatorInOtherPage =
      (allPostsAreUnread && hasMore) ||
      (!allPostsAreUnread && firstPost && firstPost.id > this._readThrough);

    // Separator in other page, we'll handle it next
    // time when onAdded() was called
    if (hasSeparatorInOtherPage) return args;

    /*
     * (4)
     * Separator in current page, let's find it now.
     */
    const firstUnreadPost = this._findNextOthersPost(
      postList,
      this._readThrough,
    );
    if (firstUnreadPost) {
      const separatorId = firstUnreadPost.data!.created_at - 1;
      this._setSeparator(firstUnreadPost.id, separatorId);
      newItems.push({
        id: separatorId,
        type: StreamItemType.NEW_MSG_SEPARATOR,
        timeStart: firstUnreadPost.data!.created_at - 1,
      });
      return { ...args, newItems };
    }
    return args;
  }

  onDelete: AssemblerDelFunc = (args: AssemblerDelFuncArgs) => {
    if (!this.separatorId) {
      return args;
    }
    const { deleted, postList, deletedIds } = args;
    const latestDeletedPostId = _.max(deleted) as number;
    const postNext = _.find(postList, ({ id }) => id >= latestDeletedPostId);
    if (!postNext) {
      deletedIds.push(this.separatorId);
    }
    return { ...args, deletedIds };
  }

  updateReadThrough(readThrough: number) {
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

  private _setSeparator(postId: number, separatorId: number) {
    this.firstUnreadPostId = postId;
    this.separatorId = separatorId;
  }
}

export { NewMessageSeparatorHandler };
