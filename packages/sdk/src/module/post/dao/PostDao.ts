/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-01 10:29:07
 * Copyright © RingCentral. All rights reserved.
 */

import { IDatabase } from 'foundation/db';
import { AbstractComposedDao } from 'sdk/module/base/dao/AbstractComposedDao';
import { daoManager } from '../../../dao';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { Post, PostView, UnreadPostQuery } from '../entity';
import { PostViewDao } from './PostViewDao';
import { DEFAULT_PAGE_SIZE } from '../constant';

class PostDao extends AbstractComposedDao<Post> {
  static COLLECTION_NAME = 'post';
  private _postViewDao: PostViewDao;
  private _currentPosts: Map<number, Post>;
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostDao.COLLECTION_NAME, db);
    this._currentPosts = new Map<number, Post>();
    this._postViewDao = daoManager.getDao(PostViewDao);
    this.addViewDaos([this._postViewDao]);
  }

  async initPosts(groupId: number) {
    const posts = await this.queryPostsByGroupId(groupId, undefined, QUERY_DIRECTION.OLDER, DEFAULT_PAGE_SIZE);
    posts.forEach((post: Post) => {
       this._currentPosts.set(post.id, post);
    });
    return posts;
  }

  async queryPostViewByIds(ids: number[]) {
    return await this._postViewDao.batchGet(ids);
  }

  async queryPostIdsByGroupId(groupId: number) {
    return await this._postViewDao.queryPostIdsByGroupId(groupId);
  }

  private _fetchPostsFunc = async (ids: number[]) => {
    const posts: Post[] = [];
    const leftIds: number[] = [];
    ids.forEach( (id: number) => {
      const post = this._currentPosts.get(id);
      if (post) {
        posts.push(post);
      } else {
        leftIds.push(id);
      }
    });

    if (leftIds.length === 0 ) {
      return posts;
    }
    const leftPosts = await this.batchGet(leftIds, true);
    return posts.concat(leftPosts);
  }

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

export { PostViewDao } from './PostViewDao';
export { PostDao };

