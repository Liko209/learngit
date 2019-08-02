import { IDatabase } from 'foundation/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipGroup } from '../../types';
import { sanitized } from '../../utils';

export class GlipGroupDao extends GlipBaseDao<GlipGroup> {
  constructor(db: IDatabase) {
    super('group', db);
  }

  async getAll(filter: (item: GlipGroup) => boolean) {
    return sanitized(
      await this.createQuery()
        .filter(filter)
        .toArray(),
    );
  }

  async getGroups() {
    return sanitized(
      await this.createQuery()
        .filter((item: GlipGroup) => !item.is_team)
        .toArray(),
    );
  }

  async getTeams() {
    return sanitized(
      await this.createQuery()
        .filter((item: GlipGroup) => !!item.is_team)
        .toArray(),
    );
  }
}
