import { getEntity } from '@/store/utils';
import {
  IFetchSortableDataProvider,
  IFetchSortableDataListHandlerOptions,
} from './../../../store/base/fetch/FetchSortableDataListHandler';
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

import { GroupState } from 'sdk/models';
import GroupStateModel from '@/store/models/GroupState';
import { HistoryHandler } from './HistoryHandler';

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
  get postIds() {
    return this._orderListHandler.sortableListStore.getIds;
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
    postDataProvider: IFetchSortableDataProvider<Post>,
    options: IFetchSortableDataListHandlerOptions<Post>,
  ) {
    this._orderListHandler = new FetchSortableDataListHandler(
      postDataProvider,
      options,
    );
    this._orderListHandler.setUpDataChangeCallback(this.handlePostsChanged);
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
    return _(this._streamListHandler.sortableListStore.items)
      .map('data')
      .compact()
      .value();
  }

  dispose() {
    if (this._orderListHandler) {
      this._orderListHandler.dispose();
    }
    if (this._streamListHandler) {
      this._streamListHandler.dispose();
    }
  }

  @action
  handlePostsChanged = (delta: TDeltaWithData) => {
    const { streamItems } = this._assemblyLine.process(
      delta,
      this._orderListHandler.listStore.items,
      this.hasMoreUp,
      this.items,
      this._readThrough,
    );
    if (streamItems) {
      const last = _.nth(streamItems, -1);
      if (last && last.type !== StreamItemType.POST) {
        streamItems.pop();
      }
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
}
