/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 23:23:08
 */
import { BaseDao } from '../base';
import { Post } from '../../models';
import { IDatabase } from 'foundation';
import { QUERY_DIRECTION } from '../constants';

class PostDao extends BaseDao<Post> {
  static COLLECTION_NAME = 'post';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostDao.COLLECTION_NAME, db);
  }

  async queryPostsByGroupId(
    groupId: number,
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<Post[]> {
    let anchorPost;
    let query = this.createQuery();
    query = query
      .orderBy('created_at', direction === QUERY_DIRECTION.OLDER)
      .equal('group_id', groupId);
    if (anchorPostId) {
      anchorPost = await this.get(anchorPostId);
      if (!anchorPost) {
        return [];
      }
      const rangeMethod =
        direction === QUERY_DIRECTION.OLDER ? 'lessThan' : 'greaterThan';
      query = query[rangeMethod]('created_at', anchorPost.created_at);
    }
    const result = await query.limit(limit).toArray();
    return result;
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
}

export default PostDao;
export { PostViewDao } from './PostViewDao';
