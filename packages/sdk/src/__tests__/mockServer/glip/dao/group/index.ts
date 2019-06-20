import { IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipGroup } from '../../types';

export class GlipGroupDao extends GlipBaseDao<GlipGroup> {
  constructor(db: IDatabase) {
    super('group', db);
  }

  async getAll(filter: (item: GlipGroup) => boolean) {
    return this.createQuery()
      .filter(filter)
      .toArray();
  }

  async getGroups() {
    return this.createQuery()
      .filter(item => !item.is_team)
      .toArray();
  }

  async getTeams() {
    return this.createQuery()
      .filter(item => !!item.is_team)
      .toArray();
  }
}
