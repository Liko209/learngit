/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { observable, computed, action } from 'mobx';
import { PostService, StateService, ENTITY } from 'sdk/service';
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
  dataModel.group_id === Number(groupId) && !dataModel.deactivated;

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortValue: dataModel.created_at,
  data: dataModel,
});

class StreamViewModel extends StoreViewModel<StreamProps> {
  private _stateService: StateService = StateService.getInstance();
  private _postService: PostService = PostService.getInstance();
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

  @computed
  get notEmpty() {
    return this.items.length > 0 || this.hasMoreUp;
  }

  constructor() {
    super();
    this.markAsRead = this.markAsRead.bind(this);
    this.loadInitialPosts = this.loadInitialPosts.bind(this);
    this.updateHistoryHandler = this.updateHistoryHandler.bind(this);
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
    if (this._transformHandler) {
      this._transformHandler.dispose();
    }
    storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
  }

  private async _loadPosts(
    direction: QUERY_DIRECTION,
    limit?: number,
  ): Promise<Post[]> {
    if (!this._transformHandler.hasMore(direction)) {
      return [];
    }
    return await this._transformHandler.fetchData(direction, limit);
  }

  private async _loadSiblingPosts(anchorPostId: number) {
    const post = await this._postService.getById(anchorPostId);
    if (post) {
      this._transformHandler.replaceAll([post]);
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
