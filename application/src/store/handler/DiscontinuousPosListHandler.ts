/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-25 13:28:35
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager, { ENTITY_NAME } from '@/store';
import { ENTITY } from 'sdk/service/eventKey';
import { IEntityDataProvider } from '../base/fetch/types';
import { Post } from 'sdk/module/post/entity';
import { PostService } from 'sdk/module/post';
import PostModel from '../models/Post';

import { IdListPaginationHandler } from './IdListPagingHandler';

enum DiscontinuousPostListType {
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
class DiscontinuousPosListHandler extends IdListPaginationHandler<
  Post,
  PostModel
> {
  constructor(sourceIds: number[]) {
    const filterFunc = (post: PostModel) => {
      return !post.deactivated;
    };

    const isMatchFunc = (post: Post) => {
      return this._sourceIds.includes(post.id) && !post.deactivated;
    };

    const options = {
      filterFunc,
      isMatchFunc,
      eventName: ENTITY.DISCONTINUOUS_POST,
      entityName: ENTITY_NAME.POST,
      entityDataProvider: new PostProvider(),
    };

    super(sourceIds, options);
  }
}

export { DiscontinuousPosListHandler, DiscontinuousPostListType };
