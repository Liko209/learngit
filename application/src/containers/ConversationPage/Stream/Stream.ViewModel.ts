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
import { StreamProps } from './types';
import { ErrorTypes } from 'sdk/utils';
import StoreViewModel from '@/store/ViewModel';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortKey: -dataModel.created_at,
});

class StreamViewModel extends StoreViewModel {
  groupStateStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP_STATE);
  stateService: StateService;
  postService: PostService;
  private _transformHandler: TransformHandler<PostModel, Post>;

  @observable
  groupId: number;
  @observable
  postIds: number[] = [];

  constructor() {
    super();
    this.stateService = StateService.getInstance();
    this.postService = PostService.getInstance();
  }

  onReceiveProps(props: StreamProps) {
    if (this.groupId === props.groupId) return;

    this.groupId = props.groupId;
    const orderListHandler = new OrderListHandler(
      isMatchedFunc(props.groupId),
      transformFunc,
    );
    this._transformHandler = new TransformHandler(orderListHandler);

    this.autorun(() => {
      this.postIds = _(this._transformHandler.orderListStore.getIds())
        .reverse()
        .value();
    });
    const postCallback = (params: IIncomingData<PostModel>) => {
      this._transformHandler.handleIncomingData(ENTITY_NAME.POST, params);
    };
    this.subscribeNotification(ENTITY.POST, postCallback);

    this.loadInitialPosts();
  }

  // componentDidMount() {
  //   this._afterRendered();
  // }

  // componentDidUpdate() {
  //   this._afterRendered();
  // }

  // componentWillUnmount() {
  //   this.dispose();
  // }

  @loading
  async loadInitialPosts() {
    try {
      const { hasMore, limit, posts } = await this._loadPosts(this.groupId);
      if (hasMore && limit && posts.length < limit) {
        this.loadPrevPosts();
      }
    } catch (err) {
      console.log(err);
      debugger; // eslint-disable-line
    }
  }

  @onScrollToTop
  @loadingTop
  loadPrevPosts() {
    return this._loadPosts(this.groupId);
  }

  @action
  private async _loadPosts(groupId: number) {
    if (!this._transformHandler.store.hasMore) {
      return {
        hasMore: false,
        posts: [],
      };
    }

    this.postService = PostService.getInstance();
    const offset = this._transformHandler.orderListStore.getSize();
    const { id: oldest = 0 } =
      this._transformHandler.orderListStore.last() || {};
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

      this._transformHandler.handlePageData(ENTITY_NAME.POST, posts, true);
      this._transformHandler.store.hasMore = hasMore;
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
