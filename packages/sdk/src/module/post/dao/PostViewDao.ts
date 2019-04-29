/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 17:20:05
 * Copyright © RingCentral. All rights reserved.
 */
import { IDatabase, mainLogger } from 'foundation';
import _ from 'lodash';
import { BaseDao } from '../../../framework/dao';
import { Post, PostView, UnreadPostQuery } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { DEFAULT_PAGE_SIZE, LOG_FETCH_POST } from '../constant';
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
        mainLogger.info(
          LOG_FETCH_POST,
          `queryPostsByGroupId() return [] for groupId:${groupId} anchorPostId:${anchorPostId} direction:${direction} limit:${limit}`,
        );
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
    mainLogger.info(
      LOG_FETCH_POST,
      `queryPostsByGroupId() from postView ${end - start}, groupId:${groupId}`,
    );

    // 3. Get posts via ids from post table
    const posts = await fetchPostFunc(postIds);
    mainLogger.info(
      LOG_FETCH_POST,
      `queryPostsByGroupId() via ids from post ${performance.now() -
        end}, groupId:${groupId}`,
    );
    return posts;
  }

  /*
   * 1, If startPostId === 0 or startPostId not exist in db, return []
   * 2, If startPostId and endPostId exist, but startIndex > endIndex, return []
   * 3, If startPostId exist, endPostId === 0 or endPostId not exist in db, will return the newer posts than startPost
   */
  async queryIntervalPostsByGroupId(
    fetchPostFunc: (ids: number[]) => Promise<Post[]>,
    { groupId, startPostId, endPostId }: UnreadPostQuery,
  ): Promise<Post[]> {
    do {
      if (startPostId && (await this.get(startPostId))) {
        let postIds = await this.queryPostIdsByGroupId(groupId);

        const startIndex = postIds.indexOf(startPostId);
        const endIndex = postIds.indexOf(endPostId);
        if (startIndex === -1 || (endIndex !== -1 && startIndex > endIndex)) {
          break;
        }

        postIds = postIds.slice(
          startIndex,
          endIndex === -1 ? postIds.length : endIndex,
        );
        const posts = await fetchPostFunc(postIds);
        return posts;
      }
    } while (false);
    mainLogger.info(
      LOG_FETCH_POST,
      `queryIntervalPostsByGroupId() return [] for groupId:${groupId} startPostId:${startPostId} endPostId:${endPostId}`,
    );
    return [];
  }

  async queryPostIdsByGroupId(groupId: number): Promise<number[]> {
    const postViews = await this.queryPostByGroupId(groupId);
    return postViews.map(postView => postView.id);
  }

  async queryPostByGroupId(groupId: number): Promise<PostView[]> {
    const query = this.createQuery().equal('group_id', groupId);
    const postViews = await query.toArray();
    return _.orderBy(postViews, 'created_at', 'asc');
  }
}
export { PostViewDao };
