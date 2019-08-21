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
import { ENTITY_NAME } from '@/store';
import storeManager from '@/store/base/StoreManager';
import StoreViewModel from '@/store/ViewModel';

import { getEntity, getGlobalValue } from '@/store/utils';
import GroupStateModel from '@/store/models/GroupState';
import { StreamProps, StreamItemType, StreamItem, STATUS } from './types';

import { HistoryHandler } from './HistoryHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import { generalErrorHandler } from '@/utils/error';
import { StreamController } from './StreamController';

import { ItemService } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';
import { mainLogger } from 'foundation/log';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError, getErrorType, ERROR_TYPES } from '@/common/catchError';
import { DIRECTION } from 'jui/components/Lists';

const BLACKLISTED_PROPS = ['viewRef'];
const LOAD_SIBLING_POST_LIMIT = 30;

class StreamViewModel extends StoreViewModel<StreamProps> {
  private _stateService = ServiceLoader.getInstance<StateService>(
    ServiceConfig.STATE_SERVICE
  );
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE
  );
  private _itemService = ServiceLoader.getInstance<ItemService>(
    ServiceConfig.ITEM_SERVICE
  );
  private _streamController: StreamController;
  private _historyHandler: HistoryHandler;

  @observable
  loadingStatus: STATUS = STATUS.PENDING;

  @observable
  errorType: ERROR_TYPES;

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
  };

  @computed
  get items() {
    return this._streamController.items;
  }

  hasMore = (direction: DIRECTION) => {
    if (direction === DIRECTION.UP) {
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
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.groupId);
  }

  @computed
  get mostRecentPostId() {
    return this._group.mostRecentPostId || 0;
  }

  @computed
  get notEmpty() {
    return this.postIds.length !== 0 || this._streamController.hasMore(QUERY_DIRECTION.OLDER);
  }

  @computed
  get firstHistoryUnreadInPage() {
    if (!this.firstHistoryUnreadPostId) return false;
    return this.postIds.includes(this.firstHistoryUnreadPostId);
  }

  @computed
  get firstHistoryUnreadPostId() {
    return this._historyHandler.getFirstUnreadPostId(
      this.postIds,
      this._streamController.hasMore(QUERY_DIRECTION.OLDER)
    );
  }

  constructor(props: StreamProps) {
    super(props, BLACKLISTED_PROPS);
    this.updateIgnoredStatus = this.updateIgnoredStatus.bind(this);
    this.loadInitialPosts = this.loadInitialPosts.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.updateHistoryHandler = this.updateHistoryHandler.bind(this);
    this._historyHandler = new HistoryHandler();
    this.initialize();
    this._streamController = new StreamController(
      props.groupId,
      this._historyHandler,
      props.jumpToPostId
    );
    this.reaction(
      () => this.loadingStatus,
      (status: STATUS) => {
        props.updateConversationStatus(status);
      },
      {
        fireImmediately: true
      }
    );
  }

  @computed
  private get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.props.groupId
    );
  }

  @computed
  private get _lastPostId() {
    return _.last(this.postIds);
  }

  @computed
  get lastPost() {
    if (!this._lastPostId) {
      return;
    }
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._lastPostId);
  }

  hasNewMessageSeparator = () => this.findNewMessageSeparatorIndex() > -1;

  findNewMessageSeparatorIndex = () =>
    this.items.findIndex(
      (item: StreamItem) => item.type === StreamItemType.NEW_MSG_SEPARATOR
    );

  findPostIndex = (postId?: number) =>
    postId
      ? this.items.findIndex(
          (item: StreamItem) =>
            item.type === StreamItemType.POST &&
            !!item.value &&
            item.value === postId
        )
      : -1;

  updateHistoryHandler() {
    this._historyHandler.update(this._groupState, this.postIds);
  }

  @action
  async loadInitialPosts() {
    this.loadInitialPostsError = undefined;
    this.loadingStatus = STATUS.PENDING;
    try {
      if (this.props.jumpToPostId) {
        await this._loadSiblingPosts(this.props.jumpToPostId);
      } else {
        await this._streamController.fetchInitialData(QUERY_DIRECTION.OLDER);
      }
      this.loadingStatus = STATUS.SUCCESS;
    } catch (err) {
      this._handleLoadInitialPostsError(err);
    }
  }

  @catchError.flash({
    isDebounce: true,
    network: 'message.prompt.notAbleToLoadOlderMessagesForNetworkIssue',
    server: 'message.prompt.notAbleToLoadOlderMessagesForServerIssue'
  })
  @action
  loadPrevPosts(count: number) {
    return this._loadPosts(QUERY_DIRECTION.OLDER, count);
  }

  @catchError.flash({
    isDebounce: true,
    network: 'message.prompt.SorryWeWereNotAbleToLoadNewerMessages',
    server: 'message.prompt.SorryWeWereNotAbleToLoadNewerMessages'
  })
  @action
  async loadNextPosts(count: number) {
    const posts = await this._loadPosts(QUERY_DIRECTION.NEWER, count);
    return posts;
  }

  @action
  loadMore = async (direction: 'up' | 'down', count: number) => {
    switch (direction) {
      case 'up':
        await this.loadPrevPosts(count);
        break;
      case 'down':
        await this.loadNextPosts(count);
        break;
      default:
        mainLogger.warn('please nominate the direction');
    }
  };

  @action
  private _syncGroupItems = () => {
    this._itemService.requestSyncGroupItems(this.props.groupId);
  };

  @action
  updateIgnoredStatus(isIgnore: boolean) {
    this._stateService.updateIgnoredStatus([this.props.groupId], isIgnore);
  }
  
  @action
  markAsRead() {
      this._stateService.updateReadStatus(this.props.groupId, false, true);
  }

  enableNewMessageSeparatorHandler = () => {
    this._streamController.enableNewMessageSep();
  };

  disableNewMessageSeparatorHandler = () => {
    this._streamController.disableNewMessageSep();
  };

  dispose() {
    super.dispose();
    this._streamController.dispose();
    this.updateIgnoredStatus(false);
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
  }

  private async _loadPosts(
    direction: QUERY_DIRECTION,
    limit?: number
  ): Promise<Post[]> {
    if (
      direction !== QUERY_DIRECTION.BOTH &&
      !this._streamController.hasMore(direction)
    ) {
      return [];
    }
    return await this._streamController.fetchData(direction, limit);
  }

  private _loadAllUnreadPosts() {
    if (!this._streamController.hasMore(QUERY_DIRECTION.OLDER)) {
      return [];
    }

    return this._streamController.fetchAllUnreadData();
  }

  private async _loadSiblingPosts(anchorPostId: number) {
    const post = await this._postService.getById(anchorPostId);
    if (post) {
      this._streamController.replacePostList([post]);
      await this._loadPosts(QUERY_DIRECTION.BOTH, LOAD_SIBLING_POST_LIMIT);
    } else {
      // TODO error handing
    }
  }

  @catchError.flash({
    isDebounce: true,
    network: 'message.prompt.notAbleToLoadOlderMessagesForNetworkIssue',
    server: 'message.prompt.notAbleToLoadOlderMessagesForServerIssue'
  })
  @action
  getFirstUnreadPostByLoadAllUnread = async () => {
    let firstUnreadPostId: number | undefined;
    if (!this.firstHistoryUnreadInPage) {
      const posts = await this._loadAllUnreadPosts();
      firstUnreadPostId = this.firstHistoryUnreadPostId;
      const firstPost = posts[0];
      if (!firstUnreadPostId && firstPost) {
        firstUnreadPostId = firstPost.id;
      }
    } else {
      firstUnreadPostId = this.firstHistoryUnreadPostId;
    }
    return firstUnreadPostId;
  };

  @action
  initialize = () => {
    this._syncGroupItems();
    const globalStore = storeManager.getGlobalStore();
    this.props.jumpToPostId = getGlobalValue(GLOBAL_KEYS.JUMP_TO_POST_ID);
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
  };

  private _canHandleError() {
    return (
      this.errorType === ERROR_TYPES.BACKEND ||
      this.errorType === ERROR_TYPES.NETWORK
    );
  }

  private _handleLoadInitialPostsError(err: Error) {
    const errorType = getErrorType(err);
    this.errorType = errorType;
    this.loadingStatus = STATUS.FAILED;
    if (this._canHandleError()) {
      throw err; // let view catch the error
    }
    generalErrorHandler(err);
  }
}

export { StreamViewModel };
