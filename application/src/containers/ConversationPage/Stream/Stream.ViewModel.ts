/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { observable, computed } from 'mobx';
import { PostService, StateService, ENTITY } from 'sdk/service';
import { Post, GroupState } from 'sdk/models';
import { ErrorTypes } from 'sdk/utils';
import storeManager, { ENTITY_NAME } from '@/store';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '@/store/base/fetch';
import { FetchDataDirection } from '@/store/base/fetch/types';
import StoreViewModel from '@/store/ViewModel';
import {
  onScrollToTop,
  onScroll,
  loading,
  loadingTop,
  onScrollToBottom,
} from '@/plugins/InfiniteListPlugin';
import { StreamProps, StreamItem } from './types';
import { PostTransformHandler } from './PostTransformHandler';
import { getEntity } from '@/store/utils';
import { NewMessageSeparatorHandler } from './NewMessageSeparatorHandler';
import GroupStateModel from '@/store/models/GroupState';
import { DateSeparatorHandler } from './DateSeparatorHandler';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortValue: dataModel.created_at,
  data: dataModel,
});

class StreamViewModel extends StoreViewModel<StreamProps> {
  groupStateStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP_STATE);
  private _stateService: StateService = StateService.getInstance();
  private _postService: PostService = PostService.getInstance();

  @observable
  private _transformHandler: PostTransformHandler;

  private _newMessageSeparatorHandler: NewMessageSeparatorHandler;
  private _initialized = false;

  @observable
  _historyGroupState?: GroupStateModel;

  @computed
  get hasHistoryUnread() {
    if (!this._historyGroupState) return false;
    const { unreadCount } = this._historyGroupState;
    return unreadCount && unreadCount > 0;
  }

  @computed
  get firstHistoryUnreadPostId() {
    console.log(
      'this._newMessageSeparatorHandler.firstUnreadPostId: ',
      this._newMessageSeparatorHandler.firstUnreadPostId,
    );
    return this._newMessageSeparatorHandler.firstUnreadPostId;
  }

  clearHistoryUnread = () => {
    this._historyGroupState = undefined;
  }

  @observable
  groupId: number;
  @observable
  postIds: number[] = [];
  @observable
  items: StreamItem[] = [];

  @computed
  get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.groupId,
    );
  }

  @computed
  get _readThrough() {
    return this._groupState.readThrough;
  }

  @computed
  get hasMore() {
    return this._transformHandler.hasMore(FetchDataDirection.UP);
  }

  constructor() {
    super();
    this.markAsRead = this.markAsRead.bind(this);
  }

  onReceiveProps(props: StreamProps) {
    if (this.groupId === props.groupId) {
      return;
    }
    if (this._transformHandler) {
      this.dispose();
    }

    this.groupId = props.groupId;
    const postDataProvider: IFetchSortableDataProvider<Post> = {
      fetchData: async (offset: number, direction, pageSize, anchor) => {
        try {
          const { posts, hasMore } = await this._postService.getPostsByGroupId({
            offset,
            groupId: props.groupId,
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
        pageSize: 3,
        isMatchFunc: isMatchedFunc(props.groupId),
        entityName: ENTITY_NAME.POST,
        eventName: ENTITY.POST,
        dataChangeCallBack: () => {},
      },
    );

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
    this.loadInitialPosts();
  }

  updateHistoryGroupState() {
    this._historyGroupState = _.cloneDeep(this._groupState);
  }

  @computed
  get historyUnreadCount() {
    const unreadCount = this._historyGroupState
      ? this._historyGroupState.unreadCount || 0
      : 0;
    return unreadCount;
  }

  @loading
  async loadInitialPosts() {
    await this._loadPosts(FetchDataDirection.UP);
    this.updateHistoryGroupState();
    this._initialized = true;
    this.markAsRead();
  }

  @onScrollToTop
  @loadingTop
  async loadPrevPosts() {
    await this._loadPosts(FetchDataDirection.UP);
  }

  @onScroll
  async handleNewMessageSeparatorState(event: { target?: HTMLInputElement }) {
    if (!event.target) return;
    const scrollEl = event.target;
    const atBottom =
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight === 0;
    const isFocused = document.hasFocus();
    if (atBottom && isFocused && this._initialized) {
      this._newMessageSeparatorHandler.disable();
    } else {
      this._newMessageSeparatorHandler.enable();
    }
  }

  @onScrollToBottom
  markAsRead() {
    const isFocused = document.hasFocus();
    if (isFocused) {
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
    this._transformHandler.dispose();
  }

  private async _loadPosts(direction: FetchDataDirection, limit?: number) {
    if (!this._transformHandler.hasMore(direction)) return;
    await this._transformHandler.fetchData(direction, limit);
  }

  loadPostUntilFirstUnread = async () => {
    if (!this._historyGroupState) return;

    const unreadCount = this._historyGroupState.unreadCount || 0;
    const readThrough = this._historyGroupState.readThrough;

    if (!readThrough) return;

    // Find first unread post id
    if (unreadCount > this.postIds.length) {
      await this._loadPosts(
        FetchDataDirection.UP,
        unreadCount - this.postIds.length + 1,
      );
    }

    console.log(
      'this.firstHistoryUnreadPostId: ',
      this.firstHistoryUnreadPostId,
    );
    return this.firstHistoryUnreadPostId;
  }
}

export { StreamViewModel };
