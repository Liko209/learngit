import { DBManager, KVStorageManager, DatabaseType } from 'foundation/db';
import schema from '../schema';

const setup = (dbType: DatabaseType = DatabaseType.LokiDB) => {
  const dbManager = new DBManager();
  dbManager.initDatabase(schema, dbType);
  const database = dbManager.getDatabase();
  return {
    dbManager,
    database,
  };
};

const setupKV = () => {
  const kvStorageManager = new KVStorageManager();
  const kvStorage = kvStorageManager.getStorage();
  return {
    kvStorageManager,
    kvStorage,
  };
};
export { setup, setupKV };
