/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-01 10:29:07
 * Copyright © RingCentral. All rights reserved.
 */

import { IDatabase } from 'foundation';
import { BaseDao } from '../../../framework/dao';
import { PostViewDao } from './PostViewDao';
import { Post, PostView, UnreadPostQuery } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { daoManager } from '../../../dao';
import _ from 'lodash';

class PostDao extends BaseDao<Post> {
  static COLLECTION_NAME = 'post';
  private _postViewDao: PostViewDao;
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostDao.COLLECTION_NAME, db);
    this._postViewDao = daoManager.getDao(PostViewDao);
  }

  getPostViewDao() {
    return this._postViewDao;
  }

  async put(item: Post | Post[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.put(item),
        Array.isArray(item)
          ? this._bulkPutPostView(item)
          : this._putPostView(item),
      ]);
    });
  }

  async bulkPut(array: Post[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.bulkPut(array), this._bulkPutPostView(array)]);
    });
  }

  async clear(): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.clear(), this.getPostViewDao().clear()]);
    });
  }

  async delete(key: number): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.delete(key), this.getPostViewDao().delete(key)]);
    });
  }

  async bulkDelete(keys: number[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkDelete(keys),
        this.getPostViewDao().bulkDelete(keys),
      ]);
    });
  }

  async queryPostIdsByGroupId(groupId: number) {
    return await this.getPostViewDao().queryPostIdsByGroupId(groupId);
  }

  private _fetchPostsFunc = async (ids: number[]) => {
    return await this.batchGet(ids, true);
  }

  async queryPostsByGroupId(
    groupId: number,
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<Post[]> {
    return this.getPostViewDao().queryPostsByGroupId(
      this._fetchPostsFunc,
      groupId,
      anchorPostId,
      direction,
      limit,
    );
  }

  async queryIntervalPostsByGroupId(
    unreadPostQuery: UnreadPostQuery,
  ): Promise<Post[]> {
    return this.getPostViewDao().queryIntervalPostsByGroupId(
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

  async doInTransaction(func: () => {}): Promise<void> {
    await this.getDb().ensureDBOpened();
    await this.getDb().getTransaction(
      'rw',
      [
        this.getDb().getCollection<PostDao, number>(PostDao.COLLECTION_NAME),
        this.getDb().getCollection<PostViewDao, number>(
          PostViewDao.COLLECTION_NAME,
        ),
      ],
      async () => {
        await func();
      },
    );
  }

  async groupPostCount(groupId: number): Promise<number> {
    const query = this.createQuery();
    return query.equal('group_id', groupId).count();
  }

  private async _putPostView(item: Post) {
    await this.getPostViewDao().put({
      id: item.id,
      group_id: item.group_id,
      created_at: item.created_at,
    });
  }

  private async _bulkPutPostView(array: Post[]) {
    await this.getPostViewDao().bulkPut(
      array.map((post: Post) => {
        return {
          id: post.id,
          group_id: post.group_id,
          created_at: post.created_at,
        };
      }),
    );
  }
}

export { PostDao };
export { PostViewDao } from './PostViewDao';
