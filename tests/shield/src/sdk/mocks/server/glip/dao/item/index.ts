import { IDatabase } from 'foundation/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipGroup, GlipItem } from '../../types';
import _ from 'lodash';

export class GlipItemDao extends GlipBaseDao<GlipItem> {
  constructor(db: IDatabase) {
    super('item', db);
  }

  async getItemsByGroupId(id: number) {
    return this.createQuery()
      .contain('group_ids', id)
      .toArray();
  }

  getItemsByPostId(ids: number[]) {
    return this.lokiCollection.where(
      item => _.intersection(item.post_ids, ids).length > 0,
    );
  }
}
