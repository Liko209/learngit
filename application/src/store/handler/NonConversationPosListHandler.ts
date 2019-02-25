/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-25 13:28:35
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager, { ENTITY_NAME } from '@/store';
import { ENTITY } from 'sdk/service/eventKey';
import { computed } from 'mobx';
import {
  FetchSortableDataListHandler,
  IdListDateProvider,
  IEntityDataProvider,
  ISortableModel,
  ISourceIdsChangeListener,
} from '../base/fetch';
import { Post } from 'sdk/module/post/entity';
import { PostService } from 'sdk/module/post';
import { QUERY_DIRECTION, DeactivatedDao } from 'sdk/dao';
import PostModel from '../models/Post';
import { IdModel } from 'sdk/src/framework/model';
import { Entity } from '../store';

enum PostListSourceType {
  BOOK_MARK_POSTS,
  AT_MENTIONS_POSTS,
  PINNED_POSTS,
}

class PostProvider implements IEntityDataProvider<Post> {
  async getByIds(ids: number[]) {
    const postService = PostService.getInstance() as PostService;
    const { posts, items } = await postService.getPostsByIds(ids);
    // set items to store.
    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items);
    return posts;
  }
}

class NonConversationPosListHandler {
  private _sourceIds: number[] = [];
  private _idSourceProvider: () => number[];
  private _foc: FetchSortableDataListHandler<IdModel>;
  private _sourceIdChangeListener: ISourceIdsChangeListener;
  constructor() {
    this._buildSortableDataHandler();
  }

  setSourceIdListProvider(provider: () => number[]) {
    this._idSourceProvider = provider;
  }

  @computed
  get sourceIds(): number[] {
    this._sourceIds = this._idSourceProvider ? this._idSourceProvider() : [];
    this._sourceIdChangeListener.onSourceIdsChanged(this._sourceIds);
    return this._sourceIds;
  }

  @computed
  get ids(): number[] {
    return this._foc.sortableListStore.getIds;
  }

  loadMorePosts(direction: QUERY_DIRECTION, pageSize: number) {
    return this._foc.fetchData(direction, pageSize);
  }

  private _buildSortableDataHandler() {
    const isMatchFunc = (model: Post) => {
      return this._sourceIds.includes(model.id);
    };

    const sortFunc = (
      lhs: ISortableModel<Post>,
      rhs: ISortableModel<Post>,
    ): number => {
      let lhsPos = -1;
      let rhsPos = -1;

      for (let i = 0; i < this._sourceIds.length; ++i) {
        lhsPos = i === lhs.id ? i : lhsPos;
        rhsPos = i === rhs.id ? i : rhsPos;
        if (lhsPos !== -1 || rhsPos !== -1) {
          break;
        }
      }
      return lhsPos - rhsPos;
    };

    const transformFunc = (model: IdModel) => ({
      id: model.id,
      sortValue: -model.id,
    });

    const dataProvider = this._buildIdListDataProvider();
    this._sourceIdChangeListener = dataProvider;
    this._foc = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc,
      sortFunc,
      transformFunc,
      entityName: ENTITY_NAME.POST,
      eventName: ENTITY.NON_CONVERSATION_POST,
    });
  }

  private _buildIdListDataProvider() {
    const dataProvider = new IdListDateProvider<Post, PostModel>(
      this.ids,
      ENTITY.NON_CONVERSATION_POST,
      ENTITY_NAME.POST,
      new PostProvider(),
    );

    const filterFunc = (model: PostModel) => {
      return !model.deactivated;
    };
    dataProvider.setFilterFunc(filterFunc);

    return dataProvider;
  }
}

export { NonConversationPosListHandler, PostListSourceType };
