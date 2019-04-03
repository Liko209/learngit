/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 17:08:35
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { computed } from 'mobx';
import StoreViewModel from '@/store/ViewModel';
import { StreamProps, SuccinctPost } from './types';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { ENTITY_NAME } from '@/store/constants';
import { ISortableModel } from '@/store/base/fetch/types';
import { loading, loadingBottom, onScrollToBottom } from '@/plugins';
import { Post } from 'sdk/module/post/entity';
import { EVENT_TYPES, ENTITY } from 'sdk/service';
import { PostService } from 'sdk/module/post';
import { transform2Map, getEntity } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager from '@/store/base/StoreManager';
import MultiEntityMapStore from '../../../store/base/MultiEntityMapStore';
import PostModel from '@/store/models/Post';

type OrderedPost = Post & {
  _index: number;
};

function addOrderIndicatorForPosts(
  posts: (Post | PostModel)[],
  sourceIdArr: number[],
) {
  posts.forEach((post: Post) => {
    (post as OrderedPost)._index = sourceIdArr.findIndex(id => id === post.id);
  });
}
class StreamViewModel extends StoreViewModel<StreamProps> {
  private _postIds: number[] = [];
  private _isMatchFunc(post: Post) {
    return !post.deactivated && this._postIds.includes(post.id);
  }

  private _options = {
    isMatchFunc: this._isMatchFunc.bind(this),
    transformFunc: (post: OrderedPost) => ({
      id: post.id,
      sortValue: post._index,
    }),
    pageSize: 20,
    hasMoreUp: false,
    hasMoreDown: true,
    entityName: ENTITY_NAME.POST,
  };

  @computed
  get ids() {
    return this._sortableListHandler.sortableListStore.getIds;
  }

  @computed
  get hasMoreDown() {
    return this._sortableListHandler.hasMore(QUERY_DIRECTION.NEWER);
  }

  private _sortableListHandler: FetchSortableDataListHandler<SuccinctPost>;

  get _postProvider() {
    return {
      fetchData: this.fetchData,
    };
  }

  fetchData = async (
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<Post>,
  ) => {
    const postService: PostService = PostService.getInstance();
    let ids;
    let hasMore;
    if (anchor) {
      const index = _(this._postIds).indexOf(anchor.id);
      const start = index + 1;
      const end = index + pageSize + 1;
      ids = _(this._postIds)
        .slice(start, end)
        .value();
      hasMore = end < this._postIds.length - 1;
    } else {
      ids = _(this._postIds)
        .slice(0, pageSize)
        .value();
      hasMore = this._postIds.length > pageSize;
    }
    const postsStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore<Post, PostModel>;
    const [idsOutOfStore, idsInStore] = postsStore.subtractedBy(ids);
    let postsFromService: Post[] = [];

    const postsFromStore = idsInStore
      .map(id => getEntity<Post, PostModel>(ENTITY_NAME.POST, id))
      .filter((post: PostModel) => !post.deactivated);
    try {
      if (idsOutOfStore.length) {
        const results = await postService.getPostsByIds(idsOutOfStore);
        postsFromService = results.posts.filter(
          (post: Post) => !post.deactivated,
        );
      }
      const data = [...postsFromService, ...postsFromStore];
      addOrderIndicatorForPosts(data, this._postIds);
      return { hasMore, data };
    } catch (err) {
      return { hasMore: true, data: [] };
    }
  }

  constructor() {
    super();
    this._sortableListHandler = new FetchSortableDataListHandler<SuccinctPost>(
      this._postProvider,
      this._options,
    );
    this.hackPostChange();
  }

  async onReceiveProps(props: StreamProps) {
    const { postIds } = props;
    // when comp did mount
    if (!this._postIds.length && postIds.length) {
      this._postIds = postIds;
      await this.fetchInitialPosts();
      return;
    }
    // when comp did update
    if (this._postIds.length !== postIds.length) {
      const added = _(postIds)
        .difference(this._postIds)
        .value();
      const deleted = _(this._postIds)
        .difference(postIds)
        .value();
      const postService: PostService = PostService.getInstance();
      this._postIds = postIds;
      if (added.length) {
        const { posts } = await postService.getPostsByIds(added);
        addOrderIndicatorForPosts(posts, this._postIds);
        this._sortableListHandler.onDataChanged({
          type: EVENT_TYPES.UPDATE,
          body: {
            ids: added,
            entities: transform2Map(posts),
          },
        });
      }
      if (deleted.length) {
        this._sortableListHandler.onDataChanged({
          type: EVENT_TYPES.DELETE,
          body: {
            ids: deleted,
          },
        });
      }
    }
  }

  @loading
  fetchInitialPosts() {
    return this._batchFetchPosts();
  }

  @onScrollToBottom((vm: StreamViewModel) => vm.hasMoreDown)
  @loadingBottom
  fetchNextPagePosts() {
    return this._batchFetchPosts();
  }

  private async _batchFetchPosts() {
    const direction = QUERY_DIRECTION.NEWER;
    if (this._sortableListHandler.hasMore(direction)) {
      return this._sortableListHandler.fetchData(direction);
    }
  }

  hackPostChange() {
    this.subscribeNotification(`${ENTITY.POST}.*`, ({ type, body }) => {
      if (type !== EVENT_TYPES.UPDATE) {
        return;
      }
      const posts: Post[] = Array.from(body.entities.values());
      addOrderIndicatorForPosts(posts, this._postIds);
      this._sortableListHandler.onDataChanged({
        body: {
          ids: body.ids,
          entities: transform2Map(posts),
        },
        type: EVENT_TYPES.UPDATE,
      });
    });
  }
}

export { StreamViewModel };
