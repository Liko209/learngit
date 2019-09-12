import { getEntity } from '@/store/utils';
import { OrdinaryPostWrapper } from './StreamItemAssemblyLine/Assembler/OrdinaryPostWrapper';
import { SingletonTagChecker } from './StreamItemAssemblyLine/Assembler/CalcItems';
import { DateSeparator } from './StreamItemAssemblyLine/Assembler/DateSeparator';
import { StreamItemAssemblyLine } from './StreamItemAssemblyLine/StreamItemAssemblyLine';
import { StreamItem, StreamItemType, IStreamItemSortableModel } from './types';
import { FetchSortableDataListHandler, TDelta } from '@/store/base/fetch';
import { NewMessageSeparatorHandler } from './StreamItemAssemblyLine/Assembler/NewMessageSeparator';
import { Post } from 'sdk/module/post/entity';
import { IPostResultHasMore } from 'sdk/module/post/entity/Post';
import _ from 'lodash';
import { computed, action } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { ENTITY_NAME } from '@/store';
import { GroupState } from 'sdk/module/state/entity';
import GroupStateModel from '@/store/models/GroupState';
import { HistoryHandler } from './HistoryHandler';
import { PostService } from 'sdk/module/post';
import { ConversationPostFocBuilder } from '@/store/handler/cache/ConversationPostFocBuilder';
import { PreFetchConversationDataHandler } from '@/store/handler/PreFetchConversationDataHandler';
import conversationPostCacheController from '@/store/handler/cache/ConversationPostCacheController';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const BEFORE_ANCHOR_POSTS_COUNT = 20;

const transformFunc = (streamItem: StreamItem): IStreamItemSortableModel => ({
  id: streamItem.id,
  sortValue: streamItem.id,
  data: streamItem,
});

class StreamController {
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE,
  );
  private _orderListHandler: FetchSortableDataListHandler<Post>;
  private _streamListHandler: FetchSortableDataListHandler<
    StreamItem,
    number,
    IStreamItemSortableModel
  >;
  private _newMessageSeparatorHandler: NewMessageSeparatorHandler;
  private _assemblyLine: StreamItemAssemblyLine;

  @computed
  get historyReadThrough() {
    return this._historyHandler.readThrough;
  }

  @computed
  get historyUnreadCount() {
    return this._historyHandler.unreadCount;
  }

  @computed
  private get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this._groupId,
    );
  }

  @computed
  private get _readThrough() {
    return this._groupState.readThrough || 0;
  }

  constructor(
    private _groupId: number,
    private _historyHandler: HistoryHandler,
    private _jumpToPostId?: number,
  ) {
    let listHandler: FetchSortableDataListHandler<Post>;
    if (this._jumpToPostId) {
      listHandler = ConversationPostFocBuilder.buildConversationPostFoc(
        this._groupId,
        this._jumpToPostId,
      );
    } else {
      listHandler = conversationPostCacheController.get(this._groupId);
      PreFetchConversationDataHandler.getInstance().setCurrentConversation(
        this._groupId,
      );
    }

    this._orderListHandler = listHandler;
    this._orderListHandler.addDataChangeCallback(this.handlePostsChanged);

    this._newMessageSeparatorHandler = new NewMessageSeparatorHandler();
    this._streamListHandler = new FetchSortableDataListHandler<StreamItem>(
      undefined,
      {
        transformFunc,
        isMatchFunc: () => true,
      },
    );
    this._assemblyLine = new StreamItemAssemblyLine([
      new DateSeparator(),
      this._newMessageSeparatorHandler,
      // new PostCombiner(),
      new OrdinaryPostWrapper(),
      new SingletonTagChecker(),
    ]);
  }

  @computed
  get items() {
    const items = this._streamListHandler.sortableListStore.items;
    let startIndex = 0;
    const firstItem = _.first(items);
    const isFirstItemPost =
      firstItem &&
      firstItem.data &&
      firstItem.data.type === StreamItemType.POST;
    if (!isFirstItemPost) {
      startIndex = 1;
    }
    let chain = _(items)
      .slice(startIndex)
      .map('data')
      .compact();

    if (!this.hasMore(QUERY_DIRECTION.OLDER)) {
      const initialPost: StreamItem = {
        id: 1,
        type: StreamItemType.INITIAL_POST,
        timeStart: 1,
      };
      chain = chain.unshift(initialPost);
    }
    return chain.value();
  }

  dispose() {
    if (this._orderListHandler) {
      this._orderListHandler.removeDataChangeCallback(this.handlePostsChanged);
    }
    if (this._streamListHandler) {
      this._streamListHandler.dispose();
    }
    if (!this._jumpToPostId) {
      PreFetchConversationDataHandler.getInstance().releaseCurrentConversation(
        this._groupId,
      );
    }
  }

  @action
  handlePostsChanged = (delta: TDelta<number, IStreamItemSortableModel>) => {
    const { streamItems } = this._assemblyLine.process(
      delta,
      this.hasMore(QUERY_DIRECTION.OLDER),
      this._readThrough,
      this._streamListHandler.listStore.items,
      this._orderListHandler.listStore.items,
    );
    if (streamItems) {
      this._streamListHandler.replaceAll(streamItems);
    }
  };

  disableNewMessageSep() {
    this._newMessageSeparatorHandler.disable();
  }
  enableNewMessageSep = () => {
    this._newMessageSeparatorHandler.enable();
  };
  replacePostList(posts: Post[]) {
    this._orderListHandler.replaceAll(posts);
  }

  hasMore(direction: QUERY_DIRECTION) {
    return this._orderListHandler.hasMore(direction);
  }

  fetchData(direction: QUERY_DIRECTION, pageSize?: number) {
    return this._orderListHandler.fetchData(direction, pageSize);
  }

  fetchInitialData(direction: QUERY_DIRECTION, pageSize?: number) {
    if (this._orderListHandler.size === 0) {
      return this._orderListHandler.fetchData(direction, pageSize);
    }
    this._orderListHandler.refreshData();
    return this._orderListHandler.listStore.items;
  }

  @action
  async fetchAllUnreadData() {
    this.enableNewMessageSep();
    await this._orderListHandler.fetchDataBy(
      QUERY_DIRECTION.OLDER,
      this._unreadPostsLoader,
    );
    return this._orderListHandler.listStore.items;
  }

  private _unreadPostsLoader = async () => {
    let result: {
      hasMore: IPostResultHasMore;
      data: Post[];
    } = {
      hasMore: {
        older: true,
        newer: false,
        both: false,
      },
      data: [],
    };

    // (1)
    // Fetch all posts between readThrough and firstPost
    const endPost = this._orderListHandler.listStore.first();
    if (endPost) {
      const {
        hasMore,
        posts,
      } = await this._postService.getUnreadPostsByGroupId({
        groupId: this._groupId,
        unreadCount: this.historyUnreadCount,
        startPostId: this.historyReadThrough || 0,
        endPostId: endPost.id,
      });
      result = {
        hasMore,
        data: posts,
      };
    }

    // (2)
    // Return all the posts from (1)
    return result;
  };
}

export { StreamController, BEFORE_ANCHOR_POSTS_COUNT };
