import OrderListStore from '@/store/base/OrderListStore';
import OrderListPresenter from '@/store/base/OrderListPresenter';
import storeManager, { ENTITY_NAME } from '@/store';

import { service } from 'sdk';
import { Post } from 'sdk/src/models';
import PostModel from '@/store/models/Post';
import { StateService as IStateService, PostService as IPostService } from 'sdk/service';
import { IIncomingData } from '@/store/store';

const { PostService, StateService, ENTITY } = service;

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortKey: -dataModel.created_at,
});

export default class ConversationStreamViewModel extends OrderListPresenter<PostModel, Post> {
  stateService: IStateService;
  postService: IPostService;
  groupStateStore = storeManager.getEntityMapStore(
    ENTITY_NAME.GROUP_STATE,
  );
  hasMore: boolean = true;
  constructor(public groupId: number) {
    super(
      new OrderListStore(`ConversationThread: ${groupId}`),
      isMatchedFunc(groupId),
      transformFunc,
    );
    const postCallback = (params: IIncomingData<PostModel>) => {
      this.handleIncomingData(ENTITY_NAME.POST, params);
    };
    this.stateService = StateService.getInstance();
    this.postService = PostService.getInstance();
    this.subscribeNotification(ENTITY.POST, postCallback);
  }

  async loadPosts() {
    this.postService = PostService.getInstance();
    const offset = this.getStore().getSize();
    const { id: oldest = 0 } = this.getStore().last() || {};
    const { posts, hasMore } = await this.postService.getPostsByGroupId({
      offset,
      groupId: Number(this.groupId),
      postId: oldest,
    });
    this.handlePageData(ENTITY_NAME.POST, posts, true);
    this.hasMore = hasMore;
  }

  markAsRead() {
    this.stateService.markAsRead(Number(this.groupId));
  }

  updateLastGroup() {
    this.stateService.updateLastGroup(Number(this.groupId));
  }

  getSize() {
    return this.getStore().getSize();
  }

  checkHasMore() {
    return this.hasMore;
  }
}
