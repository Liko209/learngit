/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { observable, computed } from 'mobx';
import { ISortableModel } from '@/store/base';

import { StreamItemType, StreamItem } from '../../types';
import { Assembler } from './Assembler';
import {
  AssemblerAddFuncArgs,
  AssemblerAddFunc,
  AssemblerDelFuncArgs,
  AssemblerDelFunc,
} from './types';

import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { getGlobalValue, getEntity } from '@/store/utils';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';

class NewMessageSeparatorHandler extends Assembler {
  private _readThrough: number = 0;
  private _disabled?: boolean;
  private readonly _userId?: number;
  private separatorId?: number;
  _oldestPost?: ISortableModel;

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
    const { postList, hasMore, streamItemList, readThrough } = args;
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
    const firstSortableModel = this._findNextOthersSortableModel(
      postList,
      this._readThrough,
    );
    let items = streamItemList;
    if (firstSortableModel) {
      const separatorId = firstSortableModel.sortValue - 1;
      this._setSeparator(firstSortableModel.id, separatorId);
      items = items.concat({
        id: separatorId,
        type: StreamItemType.NEW_MSG_SEPARATOR,
        timeStart: firstSortableModel.sortValue - 1,
      });
      return { ...args, streamItemList: items };
    }
    return args;
  }

  onDelete: AssemblerDelFunc = (args: AssemblerDelFuncArgs) => {
    if (!this.separatorId) {
      return args;
    }
    const { deleted, postList, streamItemList } = args;
    const latestDeletedPostId = _.max(deleted) as number;
    const postNext = _.find(postList, ({ id }) => id >= latestDeletedPostId);
    let filteredStreamItemList = streamItemList;
    if (!postNext) {
      filteredStreamItemList = streamItemList.filter(
        (item: StreamItem) => this.separatorId !== item.id,
      );
    }
    return { ...args, streamItemList: filteredStreamItemList };
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

  private _findNextOthersSortableModel(
    allPosts: ISortableModel[],
    postId: number,
  ) {
    const len = allPosts.length;
    let result: ISortableModel | undefined = undefined;
    for (let i = 0; i < len; i++) {
      const sortableModel = allPosts[i];
      const post = getEntity<Post, PostModel>(
        ENTITY_NAME.POST,
        sortableModel.id,
      );
      if (post.id > postId && post.creatorId !== this._userId) {
        result = sortableModel;
        break;
      }
    }
    return result;
  }

  private _setSeparator(postId: number, separatorId: number) {
    this.firstUnreadPostId = postId;
    this.separatorId = separatorId;
  }
}

export { NewMessageSeparatorHandler };
