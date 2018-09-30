import _ from 'lodash';
import { observable, autorun, action } from 'mobx';
import { Post } from 'sdk/models';
import { PostService, StateService, ENTITY } from 'sdk/service';
import OrderListHandler from '@/store/base/OrderListHandler';
import storeManager, { ENTITY_NAME } from '@/store';
import { IIncomingData } from '@/store/store';
import TransformHandler from '@/store/base/TransformHandler';
import PostModel from '@/store/models/Post';
import {
  onScrollToTop,
  loading,
  loadingTop,
} from '@/plugins/InfiniteListPlugin';
import { ConversationStreamProps } from './types';
import { ErrorTypes } from 'sdk/utils';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortKey: -dataModel.created_at,
});

class StreamViewModel extends TransformHandler<PostModel, Post> {
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
    const { hasMore, limit, posts } = await this._loadPosts(this.groupId);
    if (hasMore && limit && posts.length < limit) {
      this.loadPrevPosts();
    }
  }

  @onScrollToTop
  @loadingTop
  loadPrevPosts() {
    return this._loadPosts(this.groupId);
  }

  @action
  private async _loadPosts(groupId: number) {
    if (!this.store.hasMore) {
      return {
        hasMore: false,
        posts: [],
      };
    }

    this.postService = PostService.getInstance();
    const offset = this.orderListStore.getSize();
    const { id: oldest = 0 } = this.orderListStore.last() || {};
    try {
      const {
        posts,
        hasMore,
        limit,
      } = await this.postService.getPostsByGroupId({
        offset,
        groupId,
        postId: oldest,
      });

      this.handlePageData(ENTITY_NAME.POST, posts, true);
      this.store.hasMore = hasMore;
      return {
        hasMore,
        limit,
        posts,
      };
    } catch (err) {
      if (err.code === ErrorTypes.NETWORK) {
        // TODO error handle
      }
    }

    return {
      hasMore: false,
      posts: [],
    };
  }

  private _afterRendered() {
    this.stateService.markAsRead(this.groupId);
    this.stateService.updateLastGroup(this.groupId);
  }
}

export { StreamViewModel };
