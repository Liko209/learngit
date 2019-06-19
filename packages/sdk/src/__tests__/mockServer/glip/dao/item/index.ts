import { IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipGroup, GlipItem } from '../../types';

export class GlipItemDao extends GlipBaseDao<GlipItem> {
  constructor(db: IDatabase) {
    super('item', db);
  }

  async getItemsByGroupId(id: number) {
    return this.createQuery()
      .contain('group_ids', id)
      .toArray();
  }

  getItemsByPostId(id: number) {
    return this.createQuery()
      .contain('post_ids', id)
      .toArray();
  }
  // getItemsByGroupId(id: number) {
  //   return this.collection.where(value => {
  //     return value.group_ids.includes(id);
  //   });
  // }

  // getItemsByPostId(id: number) {
  //   return this.collection.where(value => {
  //     return value.post_ids.includes(id);
  //   });
  // }
}
