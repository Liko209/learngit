/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-25 13:28:35
 * Copyright © RingCentral. All rights reserved.
 */
import { storeManager, ENTITY_NAME } from '@/store';
import { ENTITY } from 'sdk/service/eventKey';
import { IEntityDataProvider } from '../base/fetch/types';
import { Post } from 'sdk/module/post/entity';
import { PostService, PostUtils } from 'sdk/module/post';
import PostModel from '../models/Post';

import { IdListPaginationHandler } from './IdListPagingHandler';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

enum DiscontinuousPostListType {
  BOOK_MARK_POSTS,
  AT_MENTIONS_POSTS,
  PINNED_POSTS,
}

class PostProvider implements IEntityDataProvider<Post> {
  async getByIds(ids: number[]) {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    const { posts, items } = await postService.getPostsByIds(ids);
    // set items to store.
    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items, false);
    return posts;
  }
}
class DiscontinuousPosListHandler extends IdListPaginationHandler<
  Post,
  PostModel
> {
  constructor(
    sourceIds: number[],
    postProvider?: IEntityDataProvider<Post>,
    pageSize?: number,
  ) {
    const filterFunc = (post: PostModel) => post.isValidPost();

    const isMatchFunc = (post: Post) =>
      this._sourceIds.includes(post.id) &&
      !post.deactivated &&
      !PostUtils.isSMSPost(post);

    const options = {
      filterFunc,
      isMatchFunc,
      pageSize,
      eventName: ENTITY.DISCONTINUOUS_POST,
      entityName: ENTITY_NAME.POST,
      entityDataProvider: postProvider || new PostProvider(),
    };

    super(sourceIds, options);
  }
}

export { DiscontinuousPosListHandler, DiscontinuousPostListType };
