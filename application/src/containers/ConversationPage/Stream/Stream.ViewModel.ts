import { StreamItemAssemblyLine } from './StreamItemAssemblyLine/StreamItemAssemblyLine';
/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { observable, computed, action } from 'mobx';
import { PostService, StateService, ENTITY, EVENT_TYPES } from 'sdk/service';
import { Post } from 'sdk/module/post/entity';
import { GroupState } from 'sdk/models';
import { Group } from 'sdk/module/group/entity';
import { ErrorTypes } from 'sdk/utils';
import storeManager, { ENTITY_NAME } from '@/store';

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '@/store/base/fetch';
import StoreViewModel from '@/store/ViewModel';
import {
  onScrollToTop,
  onScroll,
  loading,
  loadingTop,
  loadingBottom,
} from '@/plugins/InfiniteListPlugin';
import { getEntity, getGlobalValue, transform2Map } from '@/store/utils';
import GroupStateModel from '@/store/models/GroupState';
import { StreamProps, StreamItem, TDeltaWithData } from './types';
import { NewMessageSeparatorHandler } from './NewMessageSeparatorHandler';

import { HistoryHandler } from './HistoryHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import { QUERY_DIRECTION } from 'sdk/dao';
import GroupModel from '@/store/models/Group';
import { onScrollToBottom } from '@/plugins';
import { OrdinaryPostWrapper, DateSeparator } from './StreamItemAssemblyLine';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId) && !dataModel.deactivated;

const transformFunc = <T extends { id: number }>(dataModel: T) => ({
  id: dataModel.id,
  sortValue: dataModel.id,
  data: dataModel,
});

class StreamViewModel extends StoreViewModel<StreamProps> {
  private _stateService: StateService = StateService.getInstance();
  private _postService: PostService = PostService.getInstance();
  private _initialized = false;
  private assemblyLine: StreamItemAssemblyLine;
  @observable
  private _newMessageSeparatorHandler: NewMessageSeparatorHandler;

  @observable
  private _historyHandler: HistoryHandler;

  @computed
  get postIds() {
    return this.orderListHandler.sortableListStore.getIds();
  }

  @computed
  get items() {
    return this.streamListHandler.sortableListStore.items.map(i => i.data);
  }

  @observable
  private orderListHandler: FetchSortableDataListHandler<Post>;
  private streamListHandler: FetchSortableDataListHandler<StreamItem>;

  @computed
  get hasHistoryUnread() {
    return this._historyHandler.hasUnread;
  }

  @computed
  get historyReadThrough() {
    return this._historyHandler.readThrough;
  }

  @computed
  get historyUnreadCount() {
    return this._historyHandler.unreadCount;
  }

  @computed
  get firstHistoryUnreadPostId() {
    const firstUnreadPostId = this.hasMoreUp // !We need this to fix issues when UMI give us wrong info
      ? undefined
      : _.first(this.postIds);

    return (
      this._newMessageSeparatorHandler.firstUnreadPostId ||
      firstUnreadPostId ||
      this._historyHandler.getFirstUnreadPostId(this.postIds)
    );
  }

  @computed
  get firstHistoryUnreadInPage() {
    if (!this.firstHistoryUnreadPostId) return false;
    return this.postIds.includes(this.firstHistoryUnreadPostId);
  }

  clearHistoryUnread = () => {
    this._historyHandler.clear();
  }

  @observable
  groupId: number;

  jumpToPostId: number;

  @computed
  private get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.groupId,
    );
  }

  @computed
  get mostRecentPostId() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.groupId)
      .mostRecentPostId;
  }

  @computed
  private get _readThrough() {
    return this._groupState.readThrough;
  }

  @computed
  get hasMoreUp() {
    return this.orderListHandler.hasMore(QUERY_DIRECTION.OLDER);
  }
  @computed
  get hasMoreDown() {
    return this.orderListHandler.hasMore(QUERY_DIRECTION.NEWER);
  }

  @computed
  get notEmpty() {
    return this.items.length > 0 || this.hasMoreUp;
  }

  constructor() {
    super();
    this.markAsRead = this.markAsRead.bind(this);
    this.loadInitialPosts = this.loadInitialPosts.bind(this);
    this.updateHistoryHandler = this.updateHistoryHandler.bind(this);
    this.streamListHandler = new FetchSortableDataListHandler<StreamItem>(
      undefined,
      {
        transformFunc,
        isMatchFunc: () => true,
      },
    );
    this.assemblyLine = new StreamItemAssemblyLine([
      new DateSeparator(),
      new OrdinaryPostWrapper(),
    ]);
  }

  onReceiveProps(props: StreamProps) {
    if (this.groupId === props.groupId) {
      return;
    }
    this.initialize(props.groupId);
  }

  @loading
  async loadInitialPosts() {
    if (this.jumpToPostId) {
      await this._loadSiblingPosts(this.jumpToPostId);
    } else {
      await this._loadPosts(QUERY_DIRECTION.OLDER);
    }
  }

  updateHistoryHandler() {
    this._historyHandler.update(this._groupState, this.postIds);
  }

  @onScrollToTop
  @loadingTop
  @action
  async loadPrevPosts() {
    return this._loadPosts(QUERY_DIRECTION.OLDER);
  }

  @onScrollToBottom
  @loadingBottom
  @action
  async loadNextPosts() {
    return this._loadPosts(QUERY_DIRECTION.NEWER);
  }

  @onScroll
  async handleNewMessageSeparatorState(event: { target?: HTMLInputElement }) {
    if (!event.target) return;
    const scrollEl = event.target;
    const atBottom =
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight === 0;
    const isFocused = document.hasFocus();
    const shouldHideUmi = atBottom && isFocused;
    storeManager
      .getGlobalStore()
      .set(GLOBAL_KEYS.SHOULD_SHOW_UMI, !shouldHideUmi);
    if (shouldHideUmi && this._initialized) {
      this._newMessageSeparatorHandler.disable();
    } else {
      this._newMessageSeparatorHandler.enable();
    }
  }

  markAsRead() {
    this._stateService.markAsRead(this.groupId);
  }

  enableNewMessageSeparatorHandler = () => {
    this._newMessageSeparatorHandler.enable();
  }

  disableNewMessageSeparatorHandler = () => {
    this._newMessageSeparatorHandler.disable();
  }

  dispose() {
    super.dispose();
    if (this.orderListHandler) {
      this.orderListHandler.dispose();
    }
    if (this.streamListHandler) {
      this.streamListHandler.dispose();
    }

    storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
  }

  private async _loadPosts(
    direction: QUERY_DIRECTION,
    limit?: number,
  ): Promise<Post[]> {
    if (!this.orderListHandler.hasMore(direction)) {
      return [];
    }
    return await this.orderListHandler.fetchData(direction, limit);
  }

  private async _loadSiblingPosts(anchorPostId: number) {
    const post = await this._postService.getById(anchorPostId);
    if (post) {
      this.orderListHandler.replaceAll([post]);
      await Promise.all([
        this._loadPosts(QUERY_DIRECTION.OLDER),
        this._loadPosts(QUERY_DIRECTION.NEWER),
      ]);
    } else {
      // TODO error handing
    }
  }

  loadPostUntilFirstUnread = async () => {
    const loadCount =
      this._historyHandler.getDistanceToFirstUnread(this.postIds) + 1;

    if (loadCount > 0) {
      this.enableNewMessageSeparatorHandler();
      await this._loadPosts(QUERY_DIRECTION.OLDER, loadCount);
    }
    return this.firstHistoryUnreadPostId;
  }

  initialize = (groupId: number) => {
    const globalStore = storeManager.getGlobalStore();
    this.jumpToPostId = getGlobalValue(GLOBAL_KEYS.JUMP_TO_POST_ID);
    globalStore.set(GLOBAL_KEYS.SHOULD_SHOW_UMI, false);
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
    this.groupId = groupId;
    const postDataProvider: IFetchSortableDataProvider<Post> = {
      fetchData: async (direction, pageSize, anchor) => {
        try {
          const postService: PostService = PostService.getInstance();
          const { posts, hasMore, items } = await postService.getPostsByGroupId(
            {
              direction,
              groupId,
              postId: anchor && anchor.id,
              limit: pageSize,
            },
          );
          storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items);
          storeManager.dispatchUpdatedDataModels(ENTITY_NAME.FILE_ITEM, items); // Todo: this should be removed once item store completed the classification.
          return { hasMore, data: posts };
        } catch (err) {
          if (err.code === ErrorTypes.API_NETWORK) {
            // TODO error handle
          }
          return { data: [], hasMore: true };
        }
      },
    };

    this.orderListHandler = new FetchSortableDataListHandler(postDataProvider, {
      transformFunc,
      hasMoreUp: true,
      hasMoreDown: !!this.jumpToPostId,
      isMatchFunc: isMatchedFunc(groupId),
      entityName: ENTITY_NAME.POST,
      eventName: ENTITY.POST,
    });

    this.orderListHandler.setUpDataChangeCallback(this.handlePostsChanged);

    this._historyHandler = new HistoryHandler();
    this._newMessageSeparatorHandler = new NewMessageSeparatorHandler();
    this._newMessageSeparatorHandler.setReadThroughIfNoSeparator(
      this._readThrough,
    );

    this.autorun(() =>
      this._newMessageSeparatorHandler.setReadThroughIfNoSeparator(
        this._readThrough,
      ),
    );
    this._initialized = false;
  }

  handlePostsChanged = (delta: TDeltaWithData) => {
    const { newItems } = this.assemblyLine.process(
      delta,
      this.orderListHandler.listStore.items,
      this.hasMoreUp,
    );
    if (newItems) {
      this.streamListHandler.onDataChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: _(newItems)
            .map('id')
            .value(),
          entities: transform2Map(newItems),
        },
      });
    }
  }
}

export { StreamViewModel };
