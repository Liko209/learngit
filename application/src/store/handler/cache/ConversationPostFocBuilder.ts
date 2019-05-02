/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-01 15:22:07
 * Copyright © RingCentral. All rights reserved.
 */
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModelWithData,
  TDelta,
} from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import { PostService } from 'sdk/module/post';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager, { ENTITY_NAME } from '@/store';
import { ENTITY } from 'sdk/service';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

class PostDataProvider implements IFetchSortableDataProvider<Post> {
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE,
  );

  constructor(private _groupId: number) {}
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModelWithData<Post>,
  ): Promise<{ data: Post[]; hasMore: boolean }> {
    const { posts, hasMore, items } = await this._postService.getPostsByGroupId(
      {
        direction,
        groupId: this._groupId,
        postId: anchor && anchor.id,
        limit: pageSize,
      },
    );

    if (items && items.length) {
      storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items, false);
    }
    return { hasMore, data: posts };
  }
}

class ConversationPostFocBuilder {
  static buildConversationPostFoc(
    groupId: number,
    jump2PostId?: number,
    fetchDataCallback?: (delta: TDelta) => Promise<void>,
  ) {
    const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
      dataModel.group_id === Number(groupId) && !dataModel.deactivated;

    const options = {
      transformFunc: (dataModel: Post) => ({
        id: dataModel.id,
        sortValue: dataModel.created_at,
      }),
      hasMoreUp: true,
      hasMoreDown: !!jump2PostId,
      isMatchFunc: isMatchedFunc(groupId),
      entityName: ENTITY_NAME.POST,
      eventName: `${ENTITY.POST}.${groupId}`,
      dataChangeCallBack: fetchDataCallback,
    };

    const listHandler = new FetchSortableDataListHandler(
      new PostDataProvider(groupId),
      options,
    );

    return listHandler;
  }
}

export { ConversationPostFocBuilder };
