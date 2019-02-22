/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 17:20:05
 * Copyright © RingCentral. All rights reserved.
 */
import { IDatabase, mainLogger } from 'foundation';
import _ from 'lodash';
import { BaseDao } from '../../../framework/dao';
import { Post, PostView } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { DEFAULT_PAGE_SIZE } from '../constant';

class PostViewDao extends BaseDao<PostView> {
  static COLLECTION_NAME = 'postView';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostViewDao.COLLECTION_NAME, db);
  }

  async queryPostsByGroupId(
    fetchPostFunc: (ids: number[]) => Promise<Post[]>,
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
    let postIds = await this.queryPostIdsByGroupId(groupId);

    // 2. If post id > 0, calculate the startIndex & endIndex via direction, else limit is the endIndex
    postIds = this._slicePostIds(postIds, anchorPostId, direction, limit);
    const end = performance.now();
    mainLogger.debug(`queryPostsByGroupId from postView ${end - start}`);

    // 3. Get posts via ids from post table
    const posts = await fetchPostFunc(postIds);
    mainLogger.debug(
      `queryPostsByGroupId via ids from post ${performance.now() - end}`,
    );
    return posts;
  }

  async queryPostIdsByGroupId(groupId: number): Promise<number[]> {
    const query = this.createQuery().equal('group_id', groupId);
    const postViews = await query.toArray();
    return _.orderBy(postViews, 'created_at', 'desc').map(
      postView => postView.id,
    );
  }

  private _slicePostIds(
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
      } else if (direction === QUERY_DIRECTION.NEWER) {
        startIndex =
          postIdIndex - limit <= 0 || limit === Infinity
            ? 0
            : postIdIndex - limit;
        endIndex = postIdIndex;
      } else {
        const halfLimit =
          limit === Infinity ? DEFAULT_PAGE_SIZE / 2 : limit / 2;
        const difEnd = postIds.length - postIdIndex;
        endIndex =
          difEnd < halfLimit ? postIds.length : postIdIndex + halfLimit;
        const difStart =
          endIndex - (limit === Infinity ? DEFAULT_PAGE_SIZE : limit);
        startIndex = difStart > 0 ? difStart : 0;
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
}
export { PostViewDao };
