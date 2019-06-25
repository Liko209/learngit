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

  getPosts() {
    return this.lokiCollection.find();
  }
}
