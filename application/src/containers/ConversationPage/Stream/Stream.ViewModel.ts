/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { observable, computed } from 'mobx';
import { PostService, StateService, ENTITY, ItemService } from 'sdk/service';
import { Post, GroupState, Group } from 'sdk/models';
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
import { getEntity, getGlobalValue } from '@/store/utils';
import GroupStateModel from '@/store/models/GroupState';
import { StreamProps, StreamItem } from './types';
import { PostTransformHandler } from './PostTransformHandler';
import { NewMessageSeparatorHandler } from './NewMessageSeparatorHandler';
import { DateSeparatorHandler } from './DateSeparatorHandler';
import { HistoryHandler } from './HistoryHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import { QUERY_DIRECTION } from 'sdk/dao';
import GroupModel from '@/store/models/Group';
import { onScrollToBottom } from '@/plugins';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortValue: dataModel.created_at,
  data: dataModel,
});

class StreamViewModel extends StoreViewModel<StreamProps> {
  private _stateService: StateService = StateService.getInstance();
  private _initialized = false;

  @observable
  private _newMessageSeparatorHandler: NewMessageSeparatorHandler;

  @observable
  private _historyHandler: HistoryHandler;

  @observable
  private _transformHandler: PostTransformHandler;

  @computed
  get hasHistoryUnread() {
    return this._historyHandler.hasUnread;
  }

  @computed
  get historyUnreadCount() {
    return this._historyHandler.unreadCount;
  }

  @computed
  get firstHistoryUnreadPostId() {
    return (
      this._newMessageSeparatorHandler.firstUnreadPostId ||
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
  @observable
  postIds: number[] = [];

  jumpToPostId: number;

  @observable
  items: StreamItem[] = [];

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
    return this._transformHandler.hasMore(QUERY_DIRECTION.OLDER);
  }
  @computed
  get hasMoreDown() {
    return this._transformHandler.hasMore(QUERY_DIRECTION.NEWER);
  }

  constructor() {
    super();
    this.markAsRead = this.markAsRead.bind(this);
    this.loadInitialPosts = this.loadInitialPosts.bind(this);
  }

  onReceiveProps(props: StreamProps) {
    if (this.groupId === props.groupId) {
      return;
    }
    this.resetAll(props.groupId);
  }

  @loading
  async loadInitialPosts() {
    let posts: Post[] = [];
    if (this.jumpToPostId) {
      const post = await PostService.getInstance<PostService>().getById(
        this.jumpToPostId,
      );
      this._transformHandler.orderListStore.append([transformFunc(post)]);
      const result = await Promise.all([
        this._loadPosts(QUERY_DIRECTION.OLDER),
        this._loadPosts(QUERY_DIRECTION.NEWER),
      ]);
      posts = _(result)
        .flatten()
        .value();
    } else {
      posts = await this._loadPosts(QUERY_DIRECTION.OLDER);
    }
    if (posts && posts.length) {
      await this._prepareAllData(posts);
    }
    this._historyHandler.update(this._groupState, this.postIds);
    this._initialized = true;
    this.markAsRead();
  }

  @onScrollToTop
  @loadingTop
  async loadPrevPosts() {
    return this._loadPosts(QUERY_DIRECTION.OLDER);
  }

  @onScrollToBottom
  @loadingBottom
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
    const isFocused = document.hasFocus();
    if (isFocused && this._initialized) {
      storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, false);
      this._stateService.markAsRead(this.groupId);
    }
  }

  enableNewMessageSeparatorHandler = () => {
    this._newMessageSeparatorHandler.enable();
  }

  disableNewMessageSeparatorHandler = () => {
    this._newMessageSeparatorHandler.disable();
  }

  dispose() {
    super.dispose();
    if (this._transformHandler) {
      this._transformHandler.dispose();
    }
  }

  private async _prepareAllData(posts: Post[]) {
    const itemService = ItemService.getInstance();
    const itemIds = _(posts)
      .map('item_ids')
      .flatMap((i: number[]) => i.slice())
      .value();
    const items = await Promise.all(
      itemIds.map(itemService.getById.bind(itemService)),
    );
    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items);
  }

  private async _loadPosts(
    direction: QUERY_DIRECTION,
    limit?: number,
  ): Promise<Post[]> {
    if (!this._transformHandler.hasMore(direction)) return [];
    return await this._transformHandler.fetchData(direction, limit);
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

  resetJumpToPostId = () => {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
    this.jumpToPostId = 0;
  }

  resetAll = (groupId: number) => {
    storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, false);
    this.jumpToPostId = getGlobalValue(GLOBAL_KEYS.JUMP_TO_POST_ID);
    this.groupId = groupId;
    this.dispose();
    const postDataProvider: IFetchSortableDataProvider<Post> = {
      fetchData: async (direction, pageSize, anchor) => {
        try {
          const postService: PostService = PostService.getInstance();
          const { posts, hasMore } = await postService.getPostsByGroupId({
            direction,
            groupId,
            postId: anchor && anchor.id,
            limit: pageSize,
          });
          return { hasMore, data: posts };
        } catch (err) {
          if (err.code === ErrorTypes.NETWORK) {
            // TODO error handle
          }
          return { data: [], hasMore: true };
        }
      },
    };

    const orderListHandler = new FetchSortableDataListHandler(
      postDataProvider,
      {
        transformFunc,
        hasMoreUp: true,
        hasMoreDown: !!this.jumpToPostId,
        isMatchFunc: isMatchedFunc(groupId),
        entityName: ENTITY_NAME.POST,
        eventName: ENTITY.POST,
        dataChangeCallBack: () => {},
      },
    );

    this._historyHandler = new HistoryHandler();
    this._newMessageSeparatorHandler = new NewMessageSeparatorHandler();
    this._newMessageSeparatorHandler.setReadThroughIfNoSeparator(
      this._readThrough,
    );

    this._transformHandler = new PostTransformHandler({
      separatorHandlers: [
        this._newMessageSeparatorHandler,
        new DateSeparatorHandler(),
      ],
      handler: orderListHandler,
    });

    this.autorun(() => (this.postIds = this._transformHandler.postIds));
    this.autorun(() => (this.items = this._transformHandler.items));
    this.autorun(() =>
      this._newMessageSeparatorHandler.setReadThroughIfNoSeparator(
        this._readThrough,
      ),
    );

    this._initialized = false;
  }
}

export { StreamViewModel };
