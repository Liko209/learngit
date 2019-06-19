import { LokiDB } from 'foundation/src/db/adapter/loki';
import { ISchema, IDatabase } from 'foundation/src/db';
import { GlipBaseDao } from './GlipBaseDao';

const gen = (unique: string = 'id', indices: string[] = []) => ({
  unique,
  indices,
});
const schema: ISchema = {
  name: 'GlipServer',
  version: 1,
  schema: {
    1: {
      person: gen(),
      group: gen(),
      post: gen('id', ['group_id', 'created_at']),
      item: gen(),
      company: gen(),
      profile: gen('id', ['favorite_group_ids']),
      state: gen(),
    },
  },
};
// const db = new LokiDB(schema);
// type
export class GlipDaoManager {
  db: LokiDB;
  daoMap: Map<
    { new (db: IDatabase): GlipBaseDao<any> },
    GlipBaseDao<any>
  > = new Map();

  constructor() {
    this.db = new LokiDB(schema);
  }

  get<T extends GlipBaseDao<any>>(cls: { new (db: IDatabase): T }) {
    if (!this.daoMap.has(cls)) {
      this.daoMap.set(cls, new cls(this.db));
    }
    return this.daoMap.get(cls);
  }
}
