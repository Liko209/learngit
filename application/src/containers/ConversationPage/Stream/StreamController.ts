import { getEntity } from '@/store/utils';
import { OrdinaryPostWrapper } from './StreamItemAssemblyLine/Assembler/OrdinaryPostWrapper';
import { SingletonTagChecker } from './StreamItemAssemblyLine/Assembler/CalcItems';
import { DateSeparator } from './StreamItemAssemblyLine/Assembler/DateSeparator';
import { StreamItemAssemblyLine } from './StreamItemAssemblyLine/StreamItemAssemblyLine';
import { StreamItem, TDeltaWithData, StreamItemType } from './types';
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import { NewMessageSeparatorHandler } from './StreamItemAssemblyLine/Assembler/NewMessageSeparator';
import { Post } from 'sdk/module/post/entity';
import _ from 'lodash';
import { computed, action } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { ENTITY_NAME } from '@/store';

import { GroupState } from 'sdk/module/state/entity';
import GroupStateModel from '@/store/models/GroupState';
import { HistoryHandler } from './HistoryHandler';
import { PostService } from 'sdk/module/post';
import { ConversationPostFocBuilder } from '@/store/handler/cache/ConversationPostFocBuilder';
import preFetchConversationDataHandler from '@/store/handler/PreFetchConversationDataHandler';
import conversationPostCacheController from '@/store/handler/cache/ConversationPostCacheController';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const BEFORE_ANCHOR_POSTS_COUNT = 20;

const transformFunc = <T extends { id: number }>(dataModel: T) => ({
  id: dataModel.id,
  sortValue: dataModel.id,
  data: dataModel,
});

class StreamController {
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE,
  );
  private _orderListHandler: FetchSortableDataListHandler<Post>;
  private _streamListHandler: FetchSortableDataListHandler<StreamItem>;
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
    let listHandler;
    if (this._jumpToPostId) {
      listHandler = ConversationPostFocBuilder.buildConversationPostFoc(
        this._groupId,
        this._jumpToPostId,
      );
    } else {
      listHandler = conversationPostCacheController.get(this._groupId);
      preFetchConversationDataHandler.setCurrentConversation(this._groupId);
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
      preFetchConversationDataHandler.releaseCurrentConversation(this._groupId);
    }
  }

  @action
  handlePostsChanged = (delta: TDeltaWithData) => {
    const items = _(this._streamListHandler.listStore.items)
      .map('data')
      .compact()
      .value();
    const { streamItems } = this._assemblyLine.process(
      delta,
      this._orderListHandler.listStore.items,
      this.hasMore(QUERY_DIRECTION.OLDER),
      items,
      this._readThrough,
    );
    if (streamItems) {
      this._streamListHandler.replaceAll(streamItems);
    }
  }

  disableNewMessageSep() {
    this._newMessageSeparatorHandler.disable();
  }
  enableNewMessageSep = () => {
    this._newMessageSeparatorHandler.enable();
  }
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

    const postsNewerThanAnchor = await this._orderListHandler.fetchDataBy(
      QUERY_DIRECTION.NEWER,
      this._postsNewerThanAnchorLoader,
    );

    const firstPost = postsNewerThanAnchor[0];

    if (firstPost) {
      await this._orderListHandler.fetchDataByAnchor(
        QUERY_DIRECTION.OLDER,
        BEFORE_ANCHOR_POSTS_COUNT,
        this._orderListHandler.transform2SortableModel(firstPost),
      );
    }

    return this._orderListHandler.listStore.items;
  }

  private _postsNewerThanAnchorLoader = async () => {
    const { posts, hasMore } = await this._postService.getUnreadPostsByGroupId({
      groupId: this._groupId,
      unreadCount: this.historyUnreadCount,
      startPostId: this.historyReadThrough || 0,
      endPostId: this._orderListHandler.listStore.items[0].id,
    });
    return { hasMore, data: posts };
  }
}

export { StreamController, BEFORE_ANCHOR_POSTS_COUNT };
