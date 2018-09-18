import _ from 'lodash';
import { observable, autorun, action } from 'mobx';
import { Post } from 'sdk/models';
import { PostService, StateService, ENTITY } from 'sdk/service';
import OrderListHandler from '@/store/base/OrderListHandler';
import storeManager, { ENTITY_NAME } from '@/store';
import { IIncomingData } from '@/store/store';
import TransformHandler from '@/store/base/TransformHandler';
import PostModel from '@/store/models/Post';
import { onScrollToTop, loading } from '@/plugins/InfiniteListPlugin';
import { ConversationStreamProps } from './types';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortKey: -dataModel.created_at,
});

class ConversationStreamViewModel extends TransformHandler<PostModel, Post> {
  groupStateStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP_STATE);
  stateService: StateService;
  postService: PostService;
  @observable
  groupId: number;
  @observable
  postIds: number[] = [];

  constructor(props: ConversationStreamProps) {
    super(new OrderListHandler(isMatchedFunc(props.groupId), transformFunc));
    this.groupId = props.groupId;
    this.stateService = StateService.getInstance();
    this.postService = PostService.getInstance();
  }

  ready() {
    const postCallback = (params: IIncomingData<PostModel>) => {
      this.handleIncomingData(ENTITY_NAME.POST, params);
    };
    this.subscribeNotification(ENTITY.POST, postCallback);
    autorun(() => {
      this.postIds = _(this.store.getItems())
        .map('id')
        .reverse()
        .value();
    });
    this.loadInitialPosts();
  }

  componentDidMount() {
    this._afterRendered();
  }

  componentDidUpdate() {
    this._afterRendered();
  }

  componentWillUnmount() {
    this.dispose();
  }

  @loading
  async loadInitialPosts() {
    return this.loadPosts(this.groupId);
  }

  @onScrollToTop
  async loadPrevPosts() {
    if (!this.store.hasMore) return;
    await this.loadPosts(this.groupId);
  }

  @action
  async loadPosts(groupId: number) {
    if (!this.store.hasMore) return;

    this.postService = PostService.getInstance();
    const offset = this.orderListStore.getSize();
    const { id: oldest = 0 } = this.orderListStore.last() || {};
    const { posts, hasMore } = await this.postService.getPostsByGroupId({
      offset,
      groupId,
      postId: oldest,
    });
    this.handlePageData(ENTITY_NAME.POST, posts, true);
    this.store.hasMore = hasMore;
  }

  getSize() {
    return this.store.getSize();
  }

  private _afterRendered() {
    this.stateService.markAsRead(this.groupId);
    this.stateService.updateLastGroup(this.groupId);
  }
}
export { ConversationStreamViewModel };
