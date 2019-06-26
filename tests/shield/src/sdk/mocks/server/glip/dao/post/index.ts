import { IDatabase } from 'foundation/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipPost } from '../../types';

export class GlipPostDao extends GlipBaseDao<GlipPost> {
  constructor(db: IDatabase) {
    super('post', db);
  }

  async getPostsByGroupId(groupId: number) {
    return this.createQuery()
      .equal('group_id', groupId)
      .toArray();
  }

  async getPostsByPostIds(ids: number[]) {
    return await this.createQuery()
      .anyOf(this.unique, ids)
      .toArray();
  }

  getPosts() {
    return this.lokiCollection.find();
  }
}
