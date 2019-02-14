/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import { NewPostService } from 'sdk/module/post';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager, { ENTITY_NAME } from '@/store';
import { ENTITY } from 'sdk/service';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId) && !dataModel.deactivated;
class PostDataProvider implements IFetchSortableDataProvider<Post> {
  private _postService: NewPostService = NewPostService.getInstance();

  constructor(private _groupId: number) {}
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<Post>,
  ): Promise<{ data: Post[]; hasMore: boolean }> {
    const { posts, hasMore, items } = await this._postService.getPostsByGroupId(
      {
        direction,
        groupId: this._groupId,
        postId: anchor && anchor.id,
        limit: pageSize,
      },
    );
    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items);
    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.FILE_ITEM, items); // Todo: this should be removed once item store completed the classification.
    return { hasMore, data: posts };
  }
}

class PostCacheController {
  private _cacheMap: Map<
    number,
    FetchSortableDataListHandler<Post>
  > = new Map();

  private _currentGroupId: number = 0;

  has(groupId: number): boolean {
    return this._cacheMap[groupId] !== undefined;
  }

  get(
    groupId: number,
    jump2PostId?: number,
  ): FetchSortableDataListHandler<Post> {
    let listHandler = !!jump2PostId ? undefined : this._cacheMap[groupId];
    if (!listHandler) {
      const options = {
        transformFunc: (dataModel: Post) => ({
          id: dataModel.id,
          sortValue: dataModel.created_at,
          data: dataModel,
        }),
        hasMoreUp: true,
        hasMoreDown: !!jump2PostId,
        isMatchFunc: isMatchedFunc(groupId),
        entityName: ENTITY_NAME.POST,
        eventName: ENTITY.POST,
      };

      listHandler = new FetchSortableDataListHandler(
        new PostDataProvider(groupId),
        options,
      );

      if (!jump2PostId) {
        this.set(groupId, listHandler);
      }
    }
    return listHandler;
  }

  setCurrentConversation(groupId: number) {
    this._currentGroupId = groupId;
  }

  releaseCurrentConversation(groupId: number) {
    if (this._currentGroupId === groupId) {
      this.get(groupId).dispose();
      this._cacheMap.delete(groupId);
      this._currentGroupId = 0;
    }
  }

  set(groupId: number, listHandler: FetchSortableDataListHandler<Post>) {
    this._cacheMap[groupId] = listHandler;
  }

  remove(groupId: number) {
    if (this.has(groupId)) {
      if (this._currentGroupId !== groupId) {
        this.get(groupId).dispose();
        this._cacheMap.delete(groupId);
      }
    }
  }
}

const postCacheController = new PostCacheController();

export { PostCacheController };
export default postCacheController;
