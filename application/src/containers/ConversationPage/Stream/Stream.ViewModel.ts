/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import { ISortableModel, FetchDataDirection } from '@/store/base/fetch/types';
import _ from 'lodash';
import { observable } from 'mobx';
import { Post } from 'sdk/models';
import { PostService, StateService, ENTITY } from 'sdk/service';
import storeManager, { ENTITY_NAME } from '@/store';
import { TransformHandler } from '@/store/base/TransformHandler';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '@/store/base/fetch';

import {
  onScrollToTop,
  loading,
  loadingTop,
} from '@/plugins/InfiniteListPlugin';
import { StreamProps } from './types';
import { ErrorTypes } from 'sdk/utils';
import StoreViewModel from '@/store/ViewModel';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortValue: dataModel.created_at,
});
enum TStreamType {
  'POST',
  'GROUPED_POSTS',
  'TAG',
}
type TBaseElement = {
  type: TStreamType;
  value: number;
  meta?: any;
};

type TTransformedElement = {
  type: TStreamType;
  value: number | TBaseElement[];
  meta?: any;
};
class PostTransformHandler extends TransformHandler<TTransformedElement, Post> {
  onAppended: Function;
  constructor(
    handler: FetchSortableDataListHandler<Post>,
    onAppended: Function,
  ) {
    super(handler);
    this.onAppended = onAppended;
  }
  onAdded(direction: FetchDataDirection, addedItems: ISortableModel[]) {
    const updated = _(addedItems)
      .map(item => ({
        value: item.id,
      }))
      .differenceBy(this.listStore.items, 'value')
      .map(item => ({ type: TStreamType.POST, value: item.value }))
      .reverse()
      .value();
    const inFront = FetchDataDirection.UP === direction;
    if (!inFront) {
      this.onAppended();
    }
    this.listStore.append(updated, inFront); // new to old
  }

  onDeleted(deletedItems: number[]) {
    this.listStore.delete((item: TTransformedElement) =>
      deletedItems.includes(item.value as number),
    );
  }
}

class StreamViewModel extends StoreViewModel {
  groupStateStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP_STATE);
  private _stateService: StateService = StateService.getInstance();
  private _postService: PostService = PostService.getInstance();

  private _transformHandler: PostTransformHandler;

  @observable
  groupId: number;
  @observable
  postIds: number[] = [];

  onReceiveProps(props: StreamProps) {
    if (this.groupId === props.groupId) return;
    if (this._transformHandler) {
      this._transformHandler.dispose();
    }
    this.groupId = props.groupId;
    this.markAsRead();
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

    this._transformHandler = new PostTransformHandler(orderListHandler, () => {
      console.log('on append');
      this.markAsRead();
    });
    this.autorun(() => {
      const postIds = _(this._transformHandler.listStore.items)
        .map('value')
        .value() as number[];
      if (!_.isEqual([...this.postIds], postIds)) {
        this.postIds = postIds;
      }
    });
    this.loadInitialPosts();
  }

  @loading
  async loadInitialPosts() {
    await this._loadPosts(FetchDataDirection.UP);
  }

  @onScrollToTop
  @loadingTop
  async loadPrevPosts() {
    await this._loadPosts(FetchDataDirection.UP);
  }

  markAsRead() {
    if (this.groupId) {
      this._stateService.markAsRead(this.groupId);
    }
  }

  private async _loadPosts(direction: FetchDataDirection) {
    if (!this._transformHandler.hasMore(direction)) return;
    await this._transformHandler.fetchData(direction);
  }
}

export { StreamViewModel };
