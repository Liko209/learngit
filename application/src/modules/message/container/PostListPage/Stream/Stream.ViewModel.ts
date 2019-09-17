/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 17:08:35
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { computed, action, observable } from 'mobx';
import StoreViewModel from '@/store/ViewModel';
import { StreamProps, SuccinctPost } from './types';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { ENTITY_NAME } from '@/store/constants';
import { ISortableModelWithData } from '@/store/base/fetch/types';
import { Post } from 'sdk/module/post/entity';
import { EVENT_TYPES, ENTITY } from 'sdk/service';
import { PostService, PostUtils } from 'sdk/module/post';
import { transform2Map } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';
import PostModel from '@/store/models/Post';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

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
    return (
      post &&
      !post.deactivated &&
      this._postIds.includes(post.id) &&
      !PostUtils.isSMSPost(post)
    );
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

  @observable
  fetchInitialPosts = () => Promise.resolve();

  @observable
  shouldShowErrorPage: boolean = false;

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
        anchor?: ISortableModelWithData<Post>,
      ) => {
        let result;
        try {
          const { data, hasMore } = await this.props.postFetcher(
            direction,
            pageSize,
            anchor,
          );
          addOrderIndicatorForPosts(data, this._postIds);
          result = { data, hasMore };
        } catch (error) {
          if (this._initial) {
            this.shouldShowErrorPage = true;
          }
          result = { data: [], hasMore: true };
        }
        return result;
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
      this.fetchInitialPosts = this._fetchInitialPosts;
      return;
    }
    if (!postIds.length) {
      this._sortableListHandler.setHasMore(false, QUERY_DIRECTION.NEWER);
    }
    if (this._postIds.length !== postIds.length) {
      const added = _(postIds)
        .difference(this._postIds)
        .value();
      const deleted = _(this._postIds)
        .difference(postIds)
        .value();
      const postService = ServiceLoader.getInstance<PostService>(
        ServiceConfig.POST_SERVICE,
      );
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

  @action
  tryAgain = () => {
    this._initial = true;
    this.shouldShowErrorPage = false;
  };

  @action
  _fetchInitialPosts = async () => {
    this._sortableListHandler.setHasMore(true, QUERY_DIRECTION.NEWER);
    await this._batchFetchPosts();
    this._initial = false;
  };

  @action
  fetchNextPagePosts = async () => {
    await this._batchFetchPosts();
  };

  @action
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
