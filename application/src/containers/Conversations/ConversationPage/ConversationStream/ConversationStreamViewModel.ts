import OrderListHandler from '@/store/base/OrderListHandler';
import storeManager, { ENTITY_NAME } from '@/store';

import { Post } from 'sdk/models';
import { PostService, StateService, ENTITY } from 'sdk/service';
import { IIncomingData } from '@/store/store';
import TransformHandler from '@/store/base/TransformHandler';
import PostModel from '@/store/models/Post';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortKey: -dataModel.created_at,
});

export class ConversationStreamViewModel extends TransformHandler<
  PostModel,
  Post
> {
  groupStateStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP_STATE);
  stateService: StateService;
  postService: PostService;
  constructor(public groupId: number) {
    super(new OrderListHandler(isMatchedFunc(groupId), transformFunc));
    const postCallback = (params: IIncomingData<PostModel>) => {
      this.handleIncomingData(ENTITY_NAME.POST, params);
    };
    this.stateService = StateService.getInstance();
    this.postService = PostService.getInstance();
    this.subscribeNotification(ENTITY.POST, postCallback);
  }

  async loadPosts() {
    this.postService = PostService.getInstance();
    const offset = this.orderListStore.getSize();
    const { id: oldest = 0 } = this.orderListStore.last() || {};
    const { posts, hasMore } = await this.postService.getPostsByGroupId({
      offset,
      groupId: Number(this.groupId),
      postId: oldest,
    });
    this.handlePageData(ENTITY_NAME.POST, posts, true);
    this.store.hasMore = hasMore;
  }

  markAsRead() {
    this.stateService.markAsRead(Number(this.groupId));
  }

  updateLastGroup() {
    this.stateService.updateLastGroup(Number(this.groupId));
  }

  getSize() {
    return this.store.getSize();
  }
}
