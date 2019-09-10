import { IDatabase } from 'foundation/db';
import { GlipBaseDao } from '../../GlipBaseDao';
import { GlipClientConfig } from '../../types';

export class GlipClientConfigDao extends GlipBaseDao<GlipClientConfig> {
  constructor(db: IDatabase) {
    super('clientConfig', db);
  }
}
