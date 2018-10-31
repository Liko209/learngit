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

  private _transformHandler: PostTransformHandler;
  private _newMessageSeparatorHandler: NewMessageSeparatorHandler;

  @observable
  groupId: number;
  @observable
  postIds: number[] = [];
  @observable
  items: StreamItem[] = [];

  @computed
  get _readThrough() {
    const groupState = getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.groupId,
    );
    return groupState.readThrough;
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
      newMessageSeparatorHandler: this._newMessageSeparatorHandler,
      handler: orderListHandler,
    });

    this.autorun(() => (this.postIds = this._transformHandler.postIds));
    this.autorun(() => (this.items = this._transformHandler.items));
    this.autorun(() =>
      this._newMessageSeparatorHandler.setReadThroughIfNoSeparator(
        this._readThrough,
      ),
    );

    this.loadInitialPosts();
  }

  @loading
  async loadInitialPosts() {
    await this._loadPosts(FetchDataDirection.UP);
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
    if (atBottom && isFocused) {
      this._newMessageSeparatorHandler.disable();
    } else {
      this._newMessageSeparatorHandler.enable();
    }
  }

  @onScrollToBottom
  markAsRead() {
    const isFocused = document.hasFocus();
    if (isFocused) {
      this._newMessageSeparatorHandler.disable();
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

  private async _loadPosts(direction: FetchDataDirection) {
    if (!this._transformHandler.hasMore(direction)) return;
    await this._transformHandler.fetchData(direction);
  }
}

export { StreamViewModel };
