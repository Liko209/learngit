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
import { ArrayUtils } from '../../../utils/ArrayUtils';
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
    postIds = ArrayUtils.sliceIdArray(
      postIds,
      limit === Infinity ? DEFAULT_PAGE_SIZE : limit,
      anchorPostId,
      direction,
    );
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
    return _.orderBy(postViews, 'created_at', 'asc').map(
      postView => postView.id,
    );
  }
}
export { PostViewDao };
