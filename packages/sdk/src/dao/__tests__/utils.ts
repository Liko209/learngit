import { DBManager, KVStorageManager } from 'foundation';
import schema from '../schema';

const setup = () => {
  const dbManager = new DBManager();
  dbManager.initDatabase(schema);
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
