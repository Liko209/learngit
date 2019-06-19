import { IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipPerson } from '../../types';

export class GlipPersonDao extends GlipBaseDao<GlipPerson> {
  constructor(db: IDatabase) {
    super('person', db);
  }
}
