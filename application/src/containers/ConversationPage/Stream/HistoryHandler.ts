/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-14 12:27:09
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { observable, computed } from 'mobx';
import GroupStateModel from '@/store/models/GroupState';

class HistoryHandler {
  /**
   * The group state when `update()` was called.
   */
  @observable
  groupState: GroupStateModel | null = null;

  /**
   * The latest post when `update()` was called.
   */
  latestPostId: number | null = null;

  /**
   * Remember the current groupState and latestPostId
   */
  update(groupState: GroupStateModel, postIds: number[]) {
    this.groupState = _.cloneDeep(groupState);
    this.latestPostId = _.last(postIds) || null;
  }

  clear() {
    this.groupState = null;
    this.latestPostId = null;
  }

  @computed
  get unreadCount() {
    let count = 0;

    if (this.groupState && this.groupState.unreadCount) {
      count = this.groupState.unreadCount;
    }

    return count;
  }

  @computed
  get readThrough() {
    if (this.groupState) {
      return this.groupState.readThrough;
    }
    return;
  }

  @computed
  get hasUnread() {
    return this.unreadCount > 0;
  }

  getPostsOrderThanLatest(currentPostIds: number[]) {
    const newestPostId = this.latestPostId;
    if (!newestPostId) return [];
    return currentPostIds.filter(id => id <= newestPostId);
  }

  getFirstUnreadPostId(currentPostIds: number[]) {
    if (!this.latestPostId) return;
    const posts = this.getPostsOrderThanLatest(currentPostIds);
    return posts[posts.length - this.unreadCount];
  }

  getDistanceToFirstUnread(currentPostIds: number[]) {
    return (
      this.unreadCount - this.getPostsOrderThanLatest(currentPostIds).length
    );
  }
}

export { HistoryHandler };
