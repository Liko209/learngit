/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 23:23:08
 */
import { BaseDao } from '../base';
import { Post } from '../../models';
import { IDatabase } from 'foundation';

class PostDao extends BaseDao<Post> {
  static COLLECTION_NAME = 'post';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostDao.COLLECTION_NAME, db);
  }

  async queryPostsByGroupId(
    groupId: number,
    postId?: number,
    direction: string = 'older',
    limit: number = Infinity,
  ): Promise<Post[]> {
    let cursorPost;
    if (postId) {
      cursorPost = await this.get(postId);
    }
    let query = this.createQuery();
    query = query
      .orderBy('created_at', direction === 'older')
      .equal('group_id', groupId);
    if (cursorPost) {
      const rangeMethod = direction === 'older' ? 'lessThan' : 'greaterThan';
      query = query[rangeMethod]('created_at', cursorPost.created_at);
    }
    query = query.limit(limit);
    const result = await query.toArray();
    return result;
  }

  async queryManyPostsByIds(ids: number[]): Promise<Post[]> {
    const query = this.createQuery();
    return query.anyOf('id', ids).toArray();
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

  async purgePostsByGroupId(
    groupId: number,
    preserveCount: number = 0,
  ): Promise<void> {
    const query = this.createQuery();
    const result = await query
      .orderBy('created_at', true)
      .equal('group_id', groupId)
      .offset(preserveCount)
      .toArray();
    if (result.length) {
      await this.bulkDelete(result.map((item: Post) => item.id));
    }
  }

  async queryPreInsertPost(): Promise<Post[]> {
    const query = this.createQuery();
    return query.lessThan('id', 0).toArray();
  }
}

export default PostDao;
