import { IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipGroup } from '../../types';

export class GlipGroupDao extends GlipBaseDao<GlipGroup> {
  constructor(db: IDatabase) {
    super('group', db);
  }
}
