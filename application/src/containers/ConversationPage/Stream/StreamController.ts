import { getEntity } from '@/store/utils';
import { OrdinaryPostWrapper } from './StreamItemAssemblyLine/Assembler/OrdinaryPostWrapper';
import { SingletonTagChecker } from './StreamItemAssemblyLine/Assembler/CalcItems';
import { DateSeparator } from './StreamItemAssemblyLine/Assembler/DateSeparator';
import { StreamItemAssemblyLine } from './StreamItemAssemblyLine/StreamItemAssemblyLine';
import { StreamItem, TDeltaWithData, StreamItemType } from './types';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '@/store/base/fetch';
import { NewMessageSeparatorHandler } from './StreamItemAssemblyLine/Assembler/NewMessageSeparator';
import { Post } from 'sdk/module/post/entity';
import _ from 'lodash';
import { computed, action } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { ENTITY_NAME, storeManager } from '@/store';

import { GroupState } from 'sdk/models';
import GroupStateModel from '@/store/models/GroupState';
import { HistoryHandler } from './HistoryHandler';
import { ENTITY } from 'sdk/service';
import { NewPostService } from 'sdk/module/post';
import postCacheController from './cache/PostCacheController';

const transformFunc = <T extends { id: number }>(dataModel: T) => ({
  id: dataModel.id,
  sortValue: dataModel.id,
  data: dataModel,
});

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId) && !dataModel.deactivated;

export class StreamController {
  private _postService: NewPostService = NewPostService.getInstance();

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
    private _jumpToPostId: number,
    private _historyHandler: HistoryHandler,
  ) {
    const options = {
      transformFunc: (dataModel: Post) => ({
        id: dataModel.id,
        sortValue: dataModel.created_at,
        data: dataModel,
      }),
      hasMoreUp: true,
      hasMoreDown: !!this._jumpToPostId,
      isMatchFunc: isMatchedFunc(this._groupId),
      entityName: ENTITY_NAME.POST,
      eventName: ENTITY.POST,
    };
    const listHandler = postCacheController.get(this._groupId);
    if (!listHandler) {
      this._orderListHandler = new FetchSortableDataListHandler(
        this.postDataProvider,
        options,
      );
      this._orderListHandler.setUpDataChangeCallback(this.handlePostsChanged);
      postCacheController.set(this._groupId, this._orderListHandler);
    } else {
      this._orderListHandler = listHandler;
      this._orderListHandler.setUpDataChangeCallback(this.handlePostsChanged);
    }

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

  postDataProvider: IFetchSortableDataProvider<Post> = {
    fetchData: async (direction, pageSize, anchor) => {
      const {
        posts,
        hasMore,
        items,
      } = await this._postService.getPostsByGroupId({
        direction,
        groupId: this._groupId,
        postId: anchor && anchor.id,
        limit: pageSize,
      });
      storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items);
      storeManager.dispatchUpdatedDataModels(ENTITY_NAME.FILE_ITEM, items); // Todo: this should be removed once item store completed the classification.
      return { hasMore, data: posts };
    },
  };

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
      this._orderListHandler.setUpDataChangeCallback(undefined);
    }
    if (this._streamListHandler) {
      this._streamListHandler.dispose();
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
