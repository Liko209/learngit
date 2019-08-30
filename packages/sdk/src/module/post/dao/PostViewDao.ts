/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 17:20:05
 * Copyright © RingCentral. All rights reserved.
 */
import { IDatabase } from 'foundation/db';
import { mainLogger } from 'foundation/log';
import _ from 'lodash';
import { BaseDao } from '../../../framework/dao';
import { Post, PostView, UnreadPostQuery } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { DEFAULT_PAGE_SIZE, LOG_FETCH_POST } from '../constant';
import { ArrayUtils } from '../../../utils/ArrayUtils';
import { IViewDao } from 'sdk/module/base/dao/IViewDao';

class PostViewDao extends BaseDao<PostView>
  implements IViewDao<number, Post, PostView> {
  static COLLECTION_NAME = 'postView';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostViewDao.COLLECTION_NAME, db);
  }

  toViewItem(entity: Post): PostView {
    return {
      id: entity.id,
      group_id: entity.group_id,
      created_at: entity.created_at,
    };
  }

  toPartialViewItem(partialEntity: Partial<Post>): Partial<PostView> {
    return _.pickBy(
      {
        id: partialEntity.id,
        group_id: partialEntity.group_id,
        created_at: partialEntity.created_at,
      },
      _.identity,
    );
  }

  getCollection() {
    return this.getDb().getCollection<PostView, number>(
      PostViewDao.COLLECTION_NAME,
    );
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
    if (!postIds.length) {
      return [];
    }

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

  async queryUnreadPostsByGroupId(
    fetchPostFunc: (ids: number[]) => Promise<Post[]>,
    { groupId, startPostId, endPostId }: UnreadPostQuery,
  ): Promise<Post[]> {
    let postIds = await this.queryPostIdsByGroupId(groupId);
    const realStartPostId = startPostId
      ? _.findLast(postIds, (id: number) => id < startPostId) || 0
      : 0;
    postIds = postIds.filter(
      (id: number) => id >= realStartPostId && id <= endPostId,
    );
    return fetchPostFunc(postIds);
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
