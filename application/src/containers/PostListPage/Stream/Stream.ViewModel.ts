/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 17:08:35
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { computed } from 'mobx';
import StoreViewModel from '@/store/ViewModel';
import { StreamProps } from './types';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { ENTITY_NAME } from '@/store/constants';
import { FetchDataDirection, ISortableModel } from '@/store/base/fetch/types';
import { loading, loadingBottom, onScrollToBottom } from '@/plugins';
import { Post } from 'sdk/src/models';
import { PostService } from 'sdk/src/service';
import { EVENT_TYPES, ENTITY } from 'sdk/service';
import { transform2Map } from '@/store/utils';

class StreamViewModel extends StoreViewModel<StreamProps> {
  private _postIds: number[] = [];
  private _isMatchFunc(post: Post) {
    const existIds = this._sortableListHandler.sortableListStore.getIds();
    return existIds.includes(post.id) && !post.deactivated;
  }

  private _options = {
    isMatchFunc: this._isMatchFunc.bind(this),
    transformFunc: (post: Post) => ({
      id: post.id,
      sortValue: -post.id,
    }),
    pageSize: 50,
    hasMoreUp: false,
    hasMoreDown: true,
    entityName: ENTITY_NAME.POST,
  };

  @computed
  get ids() {
    return this._sortableListHandler.sortableListStore.getIds();
  }

  private _sortableListHandler: FetchSortableDataListHandler<Post>;

  get _postProvider() {
    /* tslint:disable-next-line */
    const self = this;
    return {
      fetchData: async (
        offset: number,
        direction: FetchDataDirection,
        pageSize: number,
        anchor?: ISortableModel<Post>,
      ) => {
        const postService = PostService.getInstance<PostService>();
        let ids;
        let hasMore;
        if (anchor) {
          const index = _(self._postIds).indexOf(anchor.id);
          const start = index + 1;
          const end = index + pageSize + 1;
          ids = _(self._postIds)
            .slice(start, end)
            .value();
          hasMore = end < self._postIds.length - 1;
        } else {
          ids = _(self._postIds)
            .slice(undefined, pageSize + 1)
            .value();
          hasMore = self._postIds.length > pageSize;
        }
        const results = await postService.getPostsByIds(ids);
        const posts = results.posts.filter((post: Post) => !post.deactivated);
        if (posts.length) {
          return { hasMore, data: posts };
        }
        return { hasMore: true, data: [] };
      },
    };
  }

  constructor() {
    super();
    this.fetchInitialPosts = this.fetchInitialPosts.bind(this);
    this._sortableListHandler = new FetchSortableDataListHandler<Post>(
      this._postProvider,
      this._options,
    );
    this.hackPostChange();
  }

  async onReceiveProps(props: StreamProps) {
    const store = this._sortableListHandler.sortableListStore;
    if (this.props.type !== props.type) {
      return store.clear();
    }
    if (this._postIds.length !== props.postIds.length) {
      this._postIds = this.props.postIds.reverse();
      const added = _(props.postIds)
        .difference(this._postIds)
        .value();
      if (added.length) {
        const postService = PostService.getInstance<PostService>();
        const { posts } = await postService.getPostsByIds(added);
        this._sortableListHandler.onDataChanged({
          type: EVENT_TYPES.PUT,
          entities: transform2Map(posts),
        });
      }
    }
  }

  @loading
  fetchInitialPosts() {
    return this._batchFetchPosts();
  }

  @onScrollToBottom
  @loadingBottom
  fetchNextPagePosts() {
    return this._batchFetchPosts();
  }

  private async _batchFetchPosts() {
    const direction = FetchDataDirection.DOWN;
    if (this._sortableListHandler.hasMore(direction)) {
      return this._sortableListHandler.fetchData(direction);
    }
  }

  hackPostChange() {
    this.subscribeNotification(ENTITY.POST, ({ type, entities }) => {
      if (type !== EVENT_TYPES.DELETE) {
        return;
      }
      const existIds = this._sortableListHandler.sortableListStore.getIds();
      const keys = _([...entities.values()])
        .map('id')
        .intersection(existIds);
      const misMatchedKeys = keys
        .filter(key => !this._isMatchFunc(entities.get(key)))
        .value();
      this._sortableListHandler.sortableListStore.removeByIds(misMatchedKeys);
    });
  }
}

export { StreamViewModel };
