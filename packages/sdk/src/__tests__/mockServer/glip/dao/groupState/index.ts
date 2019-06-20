import { IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipGroupState } from '../../types';

export class GlipGroupStateDao extends GlipBaseDao<GlipGroupState> {
  constructor(db: IDatabase) {
    super('groupState', db);
  }
}
