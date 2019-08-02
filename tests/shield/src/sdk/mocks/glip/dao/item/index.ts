import { IDatabase } from 'foundation/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipItem } from '../../types';
import _ from 'lodash';
import { sanitized } from '../../utils';

export class GlipItemDao extends GlipBaseDao<GlipItem> {
  constructor(db: IDatabase) {
    super('item', db);
  }

  async getItemsByGroupId(id: number) {
    return sanitized(
      await this.createQuery()
        .contain('group_ids', id)
        .toArray(),
    );
  }

  getItemsByPostId(ids: number[]) {
    return sanitized(
      this.lokiCollection.where(
        item => _.intersection(item.post_ids, ids).length > 0,
      ),
    );
  }
}
