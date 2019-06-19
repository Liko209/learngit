import { IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipState } from '../../types';

export class GlipStateDao extends GlipBaseDao<GlipState> {
  constructor(db: IDatabase) {
    super('state', db);
  }
}
