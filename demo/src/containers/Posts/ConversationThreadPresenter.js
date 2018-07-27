/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-04-01 17:41:31
 * Copyright © RingCentral. All rights reserved.
 */

import OrderListStore from '@/store/base/OrderListStore';
import OrderListPresenter from '@/store/base/OrderListPresenter';
import storeManager, { ENTITY_NAME } from '@/store';

import { service } from 'sdk';

const { PostService, StateService, ENTITY } = service;
// const ENTITY_ITEM_NAME = 'item';
const isMatchedFunc = groupId => dataModel =>
  dataModel.group_id === Number(groupId);
const transformFunc = dataModel => ({
  id: dataModel.id,
  sortKey: -dataModel.created_at
});
export default class ConversationThreadPresenter extends OrderListPresenter {
  constructor(groupId) {
    super(
      new OrderListStore(`ConversationThread: ${groupId}`),
      isMatchedFunc(groupId),
      transformFunc
    );
    this.groupId = groupId;
    this.hasMore = true;
    const postCallback = ({ type, entities }) => {
      this.handleIncomingData(ENTITY_NAME.POST, { type, entities });
    };
    this.stateService = StateService.getInstance();
    this.groupStateStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP_STATE
    );

    // this.subscribeNotification(`entity.${ENTITY_NAME.POST}`, postCallback);
    this.subscribeNotification(ENTITY.POST, postCallback);
  }

  loadPosts() {
    return new Promise(async (resolve, reject) => {
      try {
        const postService = PostService.getInstance();
        const offset = this.store.getSize();
        const { id: ordestPostId = 0 } = this.store.last() || {};
        const { posts, hasMore } = await postService.getPostsByGroupId({
          groupId: Number(this.groupId),
          offset,
          postId: ordestPostId
        });
        this.handlePageData(ENTITY_NAME.POST, posts, true);
        this.hasMore = hasMore;

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  markAsRead() {
    // const state = this.groupStateStore.get(Number(this.groupId));
    // if (state.unread_count && state.unread_count > 0) {
    this.stateService.markAsRead(Number(this.groupId));
    // }
  }

  updateLastGroup() {
    this.stateService.updateLastGroup(Number(this.groupId));
  }

  getSize() {
    return this.store.getSize();
  }

  checkHasMore() {
    return this.hasMore;
  }
}
