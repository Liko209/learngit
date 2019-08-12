import { IDatabase } from 'foundation/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipCompany } from '../../types';

export class GlipCompanyDao extends GlipBaseDao<GlipCompany> {
  constructor(db: IDatabase) {
    super('company', db);
  }
}
