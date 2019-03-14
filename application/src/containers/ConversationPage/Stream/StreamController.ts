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
import postCacheController from './cache/PostCacheController';

const transformFunc = <T extends { id: number }>(dataModel: T) => ({
  id: dataModel.id,
  sortValue: dataModel.id,
  data: dataModel,
});

export class StreamController {
  private _orderListHandler: FetchSortableDataListHandler<Post>;
  private _streamListHandler: FetchSortableDataListHandler<StreamItem>;
  private _newMessageSeparatorHandler: NewMessageSeparatorHandler;
  private _assemblyLine: StreamItemAssemblyLine;

  @computed
  get historyReadThrough() {
    return this._historyHandler.readThrough;
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

  @computed
  get hasMoreUp() {
    return this._orderListHandler.hasMore(QUERY_DIRECTION.OLDER);
  }

  @computed
  get hasMoreDown() {
    return this._orderListHandler.hasMore(QUERY_DIRECTION.NEWER);
  }

  constructor(
    private _groupId: number,
    private _historyHandler: HistoryHandler,
    private _jumpToPostId?: number,
  ) {
    const listHandler = postCacheController.get(
      this._groupId,
      this._jumpToPostId,
    );
    if (!this._jumpToPostId) {
      postCacheController.setCurrentConversation(this._groupId);
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
    return _(items)
      .slice(startIndex)
      .map('data')
      .compact()
      .value();
  }

  dispose() {
    if (this._orderListHandler) {
      this._orderListHandler.removeDataChangeCallback(this.handlePostsChanged);
    }
    if (this._streamListHandler) {
      this._streamListHandler.dispose();
    }

    if (!this._jumpToPostId) {
      postCacheController.releaseCurrentConversation(this._groupId);
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
      this.hasMoreUp,
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
}
