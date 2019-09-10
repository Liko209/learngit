/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-01 10:29:07
 * Copyright © RingCentral. All rights reserved.
 */

import { IDatabase } from 'foundation/db';
import { PostViewDao } from './PostViewDao';
import { Post, PostView, UnreadPostQuery } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { daoManager } from '../../../dao';
import { AbstractComposedDao } from 'sdk/module/base/dao/AbstractComposedDao';

class PostDao extends AbstractComposedDao<Post> {
  static COLLECTION_NAME = 'post';
  private _postViewDao: PostViewDao;
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostDao.COLLECTION_NAME, db);
    this._postViewDao = daoManager.getDao(PostViewDao);
    this.addViewDaos([this._postViewDao]);
  }

  async queryPostViewByIds(ids: number[]) {
    return await this._postViewDao.batchGet(ids);
  }

  async queryPostIdsByGroupId(groupId: number) {
    return await this._postViewDao.queryPostIdsByGroupId(groupId);
  }

  private _fetchPostsFunc = async (ids: number[]) =>
    await this.batchGet(ids, true);

  async queryPostsByGroupId(
    groupId: number,
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<Post[]> {
    return this._postViewDao.queryPostsByGroupId(
      this._fetchPostsFunc,
      groupId,
      anchorPostId,
      direction,
      limit,
    );
  }

  queryUnreadPostsByGroupId(unreadPostQuery: UnreadPostQuery): Promise<Post[]> {
    return this._postViewDao.queryUnreadPostsByGroupId(
      this._fetchPostsFunc,
      unreadPostQuery,
    );
  }

  async queryOldestPostByGroupId(groupId: number): Promise<Post | null> {
    const query = this.createQuery();
    return query
      .orderBy('created_at')
      .equal('group_id', groupId)
      .filter((item: Post) => !item.deactivated)
      .first();
  }

  async queryOldestPostCreationTimeByGroupId(
    groupId: number,
  ): Promise<PostView | null> {
    const postViews = await this._postViewDao.queryPostByGroupId(groupId);
    return postViews.length ? postViews[0] : null;
  }

  async queryPreInsertPost(): Promise<Post[]> {
    const query = this.createQuery();
    return query.lessThan('id', 0).toArray();
  }

  async groupPostCount(groupId: number): Promise<number> {
    const query = this.createQuery();
    return query.equal('group_id', groupId).count();
  }
}

export { PostDao };
export { PostViewDao } from './PostViewDao';
