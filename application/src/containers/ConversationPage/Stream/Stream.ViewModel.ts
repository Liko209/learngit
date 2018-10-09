/*
 * @Author: Andy Hu
 * @Date: 2018-10-08 18:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import { ISortableModel, FetchDataDirection } from '@/store/base/fetch/types';
import _ from 'lodash';
import { observable, action } from 'mobx';
import { Post } from 'sdk/models';
import { PostService, ENTITY } from 'sdk/service';
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
  sortValue: -dataModel.created_at,
});

class PostTransformHandler extends TransformHandler<ISortableModel, Post> {
  onAdded(direction: FetchDataDirection, addedItems: ISortableModel[]) {
    const updated = _(addedItems)
      .differenceBy(this.listStore.items, 'id')
      .reverse()
      .value();
    const inFront = FetchDataDirection.UP === direction;
    this.listStore.append(updated, inFront); // new to old
  }

  onDeleted(deletedItems: number[]) {
    this.listStore.delete((item: ISortableModel) =>
      deletedItems.includes(item.id),
    );
  }
}
class StreamViewModel extends StoreViewModel {
  groupStateStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP_STATE);
  private _transformHandler: PostTransformHandler;

  @observable
  groupId: number;
  @observable
  postIds: number[] = [];

  constructor() {
    super();
  }

  onReceiveProps(props: StreamProps) {
    if (this.groupId === props.groupId) return;

    this.groupId = props.groupId;
    const postDataProvider: IFetchSortableDataProvider<Post> = {
      fetchData: async (offset: number, direction, pageSize, anchor) => {
        try {
          const {
            posts,
          } = await (PostService.getInstance() as PostService).getPostsByGroupId(
            {
              offset,
              groupId: props.groupId,
              postId: anchor && anchor.id,
              limit: pageSize,
            },
          );
          return posts;
        } catch (err) {
          if (err.code === ErrorTypes.NETWORK) {
            // TODO error handle
          }
          return [];
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

    this._transformHandler = new PostTransformHandler(orderListHandler);
    this.autorun(() => {
      this.postIds = _(this._transformHandler.listStore.items)
        .map('id')
        .value();
    });
    this.loadInitialPosts();
  }

  @loading
  async loadInitialPosts() {
    await this._loadPosts(FetchDataDirection.UP);
    const hasMore = this._transformHandler.hasMore(FetchDataDirection.UP);
    hasMore && this.loadPrevPosts();
  }

  @onScrollToTop
  @loadingTop
  loadPrevPosts() {
    return this._loadPosts(FetchDataDirection.UP);
  }

  @action
  private async _loadPosts(direction: FetchDataDirection) {
    if (!this._transformHandler.hasMore(direction)) {
      return {
        posts: [],
      };
    }
    await this._transformHandler.fetchData(direction);
    return {
      posts: [],
    };
  }

  // private _afterRendered() {
  //   this.stateService.markAsRead(this.groupId);
  //   this.stateService.updateLastGroup(this.groupId);
  // }
}

export { StreamViewModel };
