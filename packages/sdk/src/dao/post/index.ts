/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 23:23:08
 */
import { BaseDao } from '../base';
import { PostViewDao } from './PostViewDao';
import { Post } from '../../module/post/entity';
import { IDatabase } from 'foundation';
import { QUERY_DIRECTION } from '../constants';
import { daoManager } from '..';

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
    await Promise.all([
      super.put(item),
      Array.isArray(item)
        ? this._bulkPutPostView(item)
        : this._putPostView(item),
    ]);
  }

  async bulkPut(array: Post[]): Promise<void> {
    await Promise.all([super.bulkPut(array), this._bulkPutPostView(array)]);
  }

  async clear(): Promise<void> {
    await Promise.all([super.clear(), this.getPostViewDao().clear()]);
  }

  async delete(key: number): Promise<void> {
    await Promise.all([super.delete(key), this.getPostViewDao().delete(key)]);
  }

  async bulkDelete(keys: number[]): Promise<void> {
    await Promise.all([
      super.bulkDelete(keys),
      this.getPostViewDao().bulkDelete(keys),
    ]);
  }

  async queryPostsByGroupId(
    groupId: number,
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<Post[]> {
    return this.getPostViewDao().queryPostsByGroupId(
      groupId,
      anchorPostId,
      direction,
      limit,
    );
    // let anchorPost;
    // let query = this.createQuery();
    // query = query
    //   .orderBy('created_at', direction === QUERY_DIRECTION.OLDER)
    //   .equal('group_id', groupId);
    // if (anchorPostId) {
    //   anchorPost = await this.get(anchorPostId);
    //   if (!anchorPost) {
    //     return [];
    //   }
    //   const rangeMethod =
    //     direction === QUERY_DIRECTION.OLDER ? 'lessThan' : 'greaterThan';
    //   query = query[rangeMethod]('created_at', anchorPost.created_at);
    // }
    // const result = await query.limit(limit).toArray();
    // return result;
  }

  queryLastPostByGroupId(groupId: number): Promise<Post | null> {
    const query = this.createQuery();
    return query
      .orderBy('created_at', true)
      .equal('group_id', groupId)
      .filter((item: Post) => !item.deactivated)
      .first();
  }

  queryOldestPostByGroupId(groupId: number): Promise<Post | null> {
    const query = this.createQuery();
    return query
      .orderBy('created_at')
      .equal('group_id', groupId)
      .filter((item: Post) => !item.deactivated)
      .first();
  }

  async queryPreInsertPost(): Promise<Post[]> {
    const query = this.createQuery();
    return query.lessThan('id', 0).toArray();
  }

  private async _putPostView(item: Post) {
    this.getPostViewDao().put({
      id: item.id,
      group_id: item.group_id,
      created_at: item.created_at,
    });
  }

  private async _bulkPutPostView(array: Post[]) {
    this.getPostViewDao().bulkPut(
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

export default PostDao;
export { PostViewDao } from './PostViewDao';
