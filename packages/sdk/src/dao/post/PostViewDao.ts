/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 17:20:05
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../base';
import PostDao from '.';
import { Post, PostView } from '../../models';
import { IDatabase, mainLogger } from 'foundation';
import { QUERY_DIRECTION } from '../constants';
import _ from 'lodash';
import { daoManager } from '..';

class PostViewDao extends BaseDao<PostView> {
  static COLLECTION_NAME = 'postView';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostViewDao.COLLECTION_NAME, db);
  }

  async queryPostsByGroupId(
    groupId: number,
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<Post[]> {
    const start = performance.now();
    let anchorPost;
    if (anchorPostId) {
      anchorPost = await this.get(anchorPostId);
      if (!anchorPost) {
        return [];
      }
    }
    // 1. Get ids from post lookup table via group id
    const query = this.createQuery().equal('group_id', groupId);
    const postViews = await query.toArray();
    let postViewIds = _.orderBy(postViews, 'created_at', 'desc').map(
      postView => postView.id,
    );

    // 2. If post id > 0, calculate the startIndex & endIndex via direction, else limit is the endIndex
    let startIndex = 0;
    let endIndex = 0;
    if (anchorPostId) {
      const postIdIndex = postViewIds.indexOf(anchorPostId);
      if (direction === QUERY_DIRECTION.OLDER) {
        startIndex = postIdIndex + 1;
        endIndex =
          limit === Infinity || postIdIndex + limit >= postViewIds.length
            ? postViewIds.length
            : startIndex + limit;
      } else {
        startIndex =
          postIdIndex - limit <= 0 || limit === Infinity
            ? 0
            : postIdIndex - limit;
        endIndex = postIdIndex;
      }
    } else {
      endIndex =
        direction === QUERY_DIRECTION.OLDER
          ? limit === Infinity || startIndex + limit > postViewIds.length
            ? postViewIds.length
            : limit
          : 0;
    }

    // 3. Slice ids
    postViewIds = postViewIds.slice(startIndex, endIndex);

    const end = performance.now();
    mainLogger.debug(`queryPostsByGroupId from lookup ${end - start}`);

    // 4. Get posts via ids from post table
    const postDao = daoManager.getDao(PostDao);
    let posts = await postDao.batchGet(postViewIds);
    posts = _.orderBy(posts, 'created_at', 'desc');
    const end1 = performance.now();
    mainLogger.debug(`queryPostsByGroupId via ids from post ${end1 - end}`);
    return posts;
  }
}
export { PostViewDao };
