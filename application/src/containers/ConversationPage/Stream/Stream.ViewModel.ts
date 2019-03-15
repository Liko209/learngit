/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import PostModel from '@/store/models/Post';
import { computed, action, observable } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { Post } from 'sdk/module/post/entity';
import { StateService } from 'sdk/module/state';
import { GroupState } from 'sdk/module/state/entity';
import { Group } from 'sdk/module/group/entity';
import { errorHelper } from 'sdk/error';
import storeManager, { ENTITY_NAME } from '@/store';
import StoreViewModel from '@/store/ViewModel';

import { getEntity, getGlobalValue } from '@/store/utils';
import GroupStateModel from '@/store/models/GroupState';
import { StreamProps, StreamItemType, StreamViewProps } from './types';

import { HistoryHandler } from './HistoryHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { generalErrorHandler } from '@/utils/error';
import { StreamController } from './StreamController';

import { ItemService } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';
import { mainLogger } from 'sdk';

class StreamViewModel extends StoreViewModel<StreamProps>
  implements StreamViewProps {
  private _stateService: StateService = StateService.getInstance();
  private _postService: PostService = PostService.getInstance();
  private _itemService: ItemService = ItemService.getInstance();
  private _streamController: StreamController;
  private _historyHandler: HistoryHandler;
  private _initialized = false;

  jumpToPostId: number;

  @observable loadInitialPostsError?: Error;

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

  hasMore = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      return this._streamController.hasMore(QUERY_DIRECTION.OLDER);
    }
    return this._streamController.hasMore(QUERY_DIRECTION.NEWER);
  }

  @computed
  get postIds(): number[] {
    return _(this.items)
      .filter({ type: StreamItemType.POST })
      .flatMap('value')
      .compact()
      .value();
  }

  @computed
  get mostRecentPostId() {
    let result: number | undefined;
    if (this.hasMore('down')) {
      result = getEntity<Group, GroupModel>(
        ENTITY_NAME.GROUP,
        this.props.groupId,
      ).mostRecentPostId;
    } else {
      result = _.last(this.postIds);
    }
    return result || 0;
  }

  @computed
  get notEmpty() {
    return this.postIds.length !== 0 || this.hasMore('up');
  }

  @computed
  get firstHistoryUnreadInPage() {
    if (!this.firstHistoryUnreadPostId) return false;
    return this.postIds.includes(this.firstHistoryUnreadPostId);
  }

  @computed
  get firstHistoryUnreadPostId() {
    const firstUnreadPostId = this.hasMore('up') // !We need this to fix issues when UMI give us wrong info
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

    this._streamController = new StreamController(
      props.groupId,
      this._historyHandler,
      this.jumpToPostId,
    );
  }

  @computed
  private get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.props.groupId,
    );
  }

  @computed
  get lastPost() {
    const lastPostId = _.last(this.postIds);
    if (!lastPostId) {
      return;
    }
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, lastPostId);
  }

  updateHistoryHandler() {
    this._historyHandler.update(this._groupState, this.postIds);
  }

  async loadInitialPosts() {
    this.loadInitialPostsError = undefined;
    try {
      if (this.jumpToPostId) {
        await this._loadSiblingPosts(this.jumpToPostId);
      } else {
        await this._streamController.fetchInitialData(QUERY_DIRECTION.OLDER);
      }
    } catch (err) {
      this._handleLoadInitialPostsError(err);
    }
  }

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
  @action
  loadMore = async (direction: 'up' | 'down') => {
    switch (direction) {
      case 'up':
        await this.loadPrevPosts();
        break;
      case 'down':
        await this.loadNextPosts();
        break;
      default:
        mainLogger.warn('please nominate the direction');
    }
  }

  handleNewMessageSeparatorState = async (
    event: React.UIEvent<HTMLElement>,
  ) => {
    if (!event.target) return;
    const scrollEl = event.currentTarget;
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

  @action
  private _syncGroupItems = () => {
    this._itemService.requestSyncGroupItems(this.props.groupId);
  }

  markAsRead() {
    this._stateService.updateReadStatus(this.props.groupId, false, true);
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
      this._debouncedToast(direction);
    } else {
      generalErrorHandler(err);
    }
  }

  private _debouncedToast = _.wrap(
    _.debounce(
      (direction: QUERY_DIRECTION) => {
        Notification.flashToast({
          message:
            direction === QUERY_DIRECTION.OLDER
              ? 'message.prompt.SorryWeWereNotAbleToLoadOlderMessages'
              : 'message.prompt.SorryWeWereNotAbleToLoadNewerMessages',
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
      },
      1000,
      { trailing: false, leading: true },
    ),
    (func, direction: QUERY_DIRECTION) => {
      return func(direction);
    },
  );
}

export { StreamViewModel };
