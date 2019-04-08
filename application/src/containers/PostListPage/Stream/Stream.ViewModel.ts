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
import { transform2Map } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';
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
  private _initial: boolean = true;
  private _isMatchFunc(post: Post) {
    return post && !post.deactivated && this._postIds.includes(post.id);
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
      fetchData: async (
        direction: QUERY_DIRECTION,
        pageSize: number,
        anchor?: ISortableModel<Post>,
      ) => {
        console.log('hihihi', this.props);
        const { data, hasMore } = await this.props.postFetcher(
          direction,
          pageSize,
          anchor,
        );
        addOrderIndicatorForPosts(data, this._postIds);
        return { data, hasMore };
      },
    };
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
    const { postIds, selfProvide } = props;

    const shouldRunInitial =
      (selfProvide && this._initial) ||
      (!selfProvide && !this._postIds.length && postIds.length);
    if (shouldRunInitial) {
      this._postIds = postIds;
      await this.fetchInitialPosts();
      return;
    }

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
    this._initial = false;
    this._sortableListHandler.setHasMore(true, QUERY_DIRECTION.NEWER);
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
