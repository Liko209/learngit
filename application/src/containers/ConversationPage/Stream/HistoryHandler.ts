/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-14 12:27:09
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { observable, computed } from 'mobx';
import GroupStateModel from '@/store/models/GroupState';

class HistoryHandler {
  @observable
  groupState: GroupStateModel | null = null;

  newestPostId: number | null = null;

  update(groupState: GroupStateModel, postIds: number[]) {
    this.groupState = _.cloneDeep(groupState);
    this.newestPostId = _.last(postIds) || null;
  }

  clear() {
    this.groupState = null;
    this.newestPostId = null;
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
  get hasUnread() {
    return this.unreadCount > 0;
  }

  getPostsLteNewest(currentPostIds: number[]) {
    const newestPostId = this.newestPostId;
    if (!newestPostId) return [];
    return currentPostIds.filter(id => id <= newestPostId);
  }

  getDistanceToFirstUnread(currentPostIds: number[]) {
    return this.unreadCount - this.getPostsLteNewest(currentPostIds).length;
  }
}

export { HistoryHandler };
