import { IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipProfile } from '../../types';

export class GlipProfileDao extends GlipBaseDao<GlipProfile> {
  constructor(db: IDatabase) {
    super('profile', db);
  }
}
