/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 17:20:05
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../../framework/dao';
import PostDao from '.';
import { Post, PostView } from '../../module/post/entity';
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
    let postIds = await this._queryPostIdsByGroupId(groupId);

    // 2. If post id > 0, calculate the startIndex & endIndex via direction, else limit is the endIndex
    postIds = this._handlePostIds(postIds, anchorPostId, direction, limit);
    const end = performance.now();
    mainLogger.debug(`queryPostsByGroupId from postView ${end - start}`);

    // 3. Get posts via ids from post table
    const posts = this._getPostByPostIds(postIds);
    mainLogger.debug(
      `queryPostsByGroupId via ids from post ${performance.now() - end}`,
    );
    return posts;
  }

  private async _queryPostIdsByGroupId(groupId: number): Promise<number[]> {
    const query = this.createQuery().equal('group_id', groupId);
    const postViews = await query.toArray();
    return _.orderBy(postViews, 'created_at', 'desc').map(
      postView => postView.id,
    );
  }

  private _handlePostIds(
    postIds: number[],
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ) {
    let startIndex = 0;
    let endIndex = 0;
    if (anchorPostId) {
      const postIdIndex = postIds.indexOf(anchorPostId);
      if (direction === QUERY_DIRECTION.OLDER) {
        startIndex = postIdIndex + 1;
        endIndex =
          limit === Infinity || postIdIndex + limit >= postIds.length
            ? postIds.length
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
          ? limit === Infinity || startIndex + limit > postIds.length
            ? postIds.length
            : limit
          : 0;
    }

    // Slice ids
    return postIds.slice(startIndex, endIndex);
  }

  private async _getPostByPostIds(postIds: number[]): Promise<Post[]> {
    const postDao = daoManager.getDao(PostDao);
    const posts = await postDao.batchGet(postIds);
    return _.orderBy(posts, 'created_at', 'desc');
  }
}
export { PostViewDao };
