/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */
import { IFetchSortableDataProvider } from './../../../store/base/fetch/FetchSortableDataListHandler';
import _ from 'lodash';
import { computed, action, observable } from 'mobx';
import { ENTITY } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import { Post } from 'sdk/module/post/entity';
import { StateService } from 'sdk/module/state';
import { GroupState } from 'sdk/models';
import { Group } from 'sdk/module/group/entity';
import { errorHelper } from 'sdk/error';
import storeManager, { ENTITY_NAME } from '@/store';
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
import { StreamProps } from './types';

import { HistoryHandler } from './HistoryHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import { onScrollToBottom } from '@/plugins';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { generalErrorHandler } from '@/utils/error';
import { StreamController } from './StreamController';

import { ItemService } from 'sdk/module/item';
import { NewPostService } from 'sdk/module/post';
const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId) && !dataModel.deactivated;

class StreamViewModel extends StoreViewModel<StreamProps> {
  private _stateService: StateService = StateService.getInstance();
  private _postService: NewPostService = NewPostService.getInstance();
  private _itemService: ItemService = ItemService.getInstance();
  private _streamController: StreamController;
  private _historyHandler: HistoryHandler;
  private _initialized = false;

  jumpToPostId: number;

  @observable loadInitialPostsError: Error | null = null;

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

  clearHistoryUnread = () => {
    this._historyHandler.clear();
  }

  @computed
  get items() {
    return this._streamController.items;
  }

  @computed
  get hasMoreUp() {
    return this._streamController.hasMoreUp;
  }

  @computed
  get hasMoreDown() {
    return this._streamController.hasMoreDown;
  }

  @computed
  get postIds() {
    return _(this.items)
      .flatMap('value')
      .compact()
      .value();
  }

  @computed
  get mostRecentPostId() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.groupId)
      .mostRecentPostId;
  }

  @computed
  get notEmpty() {
    return this.items.length > 0 || this.hasMoreUp;
  }

  @computed
  get firstHistoryUnreadInPage() {
    if (!this.firstHistoryUnreadPostId) return false;
    return this.postIds.includes(this.firstHistoryUnreadPostId);
  }

  @computed
  get firstHistoryUnreadPostId() {
    const firstUnreadPostId = this.hasMoreUp // !We need this to fix issues when UMI give us wrong info
      ? undefined
      : _.first(this.postIds);

    return (
      firstUnreadPostId ||
      this._historyHandler.getFirstUnreadPostId(this.postIds)
    );
  }

  constructor(props: StreamProps) {
    super(props);
    this.markAsRead = this.markAsRead.bind(this);
    this.loadInitialPosts = this.loadInitialPosts.bind(this);
    this.updateHistoryHandler = this.updateHistoryHandler.bind(this);
    this._historyHandler = new HistoryHandler();
    this.initialize(props.groupId);
    const options = {
      transformFunc: (dataModel: Post) => ({
        id: dataModel.id,
        sortValue: dataModel.created_at,
        data: dataModel,
      }),
      hasMoreUp: true,
      hasMoreDown: !!this.jumpToPostId,
      isMatchFunc: isMatchedFunc(props.groupId),
      entityName: ENTITY_NAME.POST,
      eventName: ENTITY.POST,
    };

    this._streamController = new StreamController(
      props.groupId,
      this._historyHandler,
      this.postDataProvider,
      options,
    );
  }
  postDataProvider: IFetchSortableDataProvider<Post> = {
    fetchData: async (direction, pageSize, anchor) => {
      const {
        posts,
        hasMore,
        items,
      } = await this._postService.getPostsByGroupId({
        direction,
        groupId: this.props.groupId,
        postId: anchor && anchor.id,
        limit: pageSize,
      });
      storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items);
      storeManager.dispatchUpdatedDataModels(ENTITY_NAME.FILE_ITEM, items); // Todo: this should be removed once item store completed the classification.
      return { hasMore, data: posts };
    },
  };

  @computed
  private get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.props.groupId,
    );
  }

  updateHistoryHandler() {
    this._historyHandler.update(this._groupState, this.postIds);
  }

  @loading
  async loadInitialPosts() {
    this.loadInitialPostsError = null;
    try {
      if (this.jumpToPostId) {
        await this._loadSiblingPosts(this.jumpToPostId);
      } else {
        await this._loadPosts(QUERY_DIRECTION.OLDER);
      }
    } catch (err) {
      this._handleLoadInitialPostsError(err);
    }
  }

  @onScrollToTop
  @loadingTop
  @action
  async loadPrevPosts() {
    try {
      const posts = await this._loadPosts(QUERY_DIRECTION.OLDER);
      return posts;
    } catch (err) {
      this._handleLoadMoreError(err, QUERY_DIRECTION.OLDER);
      return;
    }
  }

  @onScrollToBottom
  @loadingBottom
  @action
  async loadNextPosts() {
    try {
      const posts = await this._loadPosts(QUERY_DIRECTION.NEWER);
      return posts;
    } catch (err) {
      this._handleLoadMoreError(err, QUERY_DIRECTION.NEWER);
      return;
    }
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
      this._streamController.disableNewMessageSep();
    } else {
      this._streamController.enableNewMessageSep();
    }
  }

  private _syncGroupItems() {
    this._itemService.requestSyncGroupItems(this.props.groupId);
  }

  markAsRead() {
    this._stateService.updateReadStatus(this.props.groupId, false);
  }

  enableNewMessageSeparatorHandler = () => {
    this._streamController.enableNewMessageSep();
  }

  disableNewMessageSeparatorHandler = () => {
    this._streamController.disableNewMessageSep();
  }

  dispose() {
    super.dispose();
    this._streamController.dispose();
    storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
  }

  private async _loadPosts(
    direction: QUERY_DIRECTION,
    limit?: number,
  ): Promise<Post[]> {
    if (!this._streamController.hasMore(direction)) {
      return [];
    }
    return await this._streamController.fetchData(direction, limit);
  }

  private async _loadSiblingPosts(anchorPostId: number) {
    const post = await this._postService.getById(anchorPostId);
    if (post) {
      this._streamController.replacePostList([post]);
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
      this._streamController.enableNewMessageSep();
      await this._loadPosts(QUERY_DIRECTION.OLDER, loadCount);
    }
    return this.firstHistoryUnreadPostId;
  }

  initialize = (groupId: number) => {
    this._syncGroupItems();
    const globalStore = storeManager.getGlobalStore();
    this.jumpToPostId = getGlobalValue(GLOBAL_KEYS.JUMP_TO_POST_ID);
    globalStore.set(GLOBAL_KEYS.SHOULD_SHOW_UMI, false);
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
    this._initialized = false;
  }

  private _canHandleError(err: Error) {
    return (
      errorHelper.isBackEndError(err) ||
      errorHelper.isNetworkConnectionError(err)
    );
  }

  private _handleLoadInitialPostsError(err: Error) {
    if (this._canHandleError(err)) {
      this.loadInitialPostsError = err;
    } else {
      generalErrorHandler(err);
    }
  }

  private _handleLoadMoreError(err: Error, direction: QUERY_DIRECTION) {
    if (this._canHandleError(err)) {
      Notification.flashToast({
        message: `SorryWeWereNotAbleToLoad${
          direction === QUERY_DIRECTION.OLDER ? 'Older' : 'Newer'
        }Messages`,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    } else {
      generalErrorHandler(err);
    }
  }
}

export { StreamViewModel };
