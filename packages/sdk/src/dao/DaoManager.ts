/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:00:57
 */
import { DBManager, KVStorageManager, DexieDB } from 'foundation';
import BaseDao from './base/BaseDao'; // eslint-disable-line
import BaseKVDao from './base/BaseKVDao'; // eslint-disable-line
import schema from './schema';
import Manager from '../Manager';
import { Newable } from '../types';
import ConfigDao from './config/index';
import { DB_SCHEMA_VERSION, LAST_INDEX_TIMESTAMP } from './config/constants';

class DaoManager extends Manager<BaseDao<any> | BaseKVDao> {
  private kvStorageManager: KVStorageManager;
  private dbManager: DBManager;

  constructor() {
    super();
    this.kvStorageManager = new KVStorageManager();
    this.dbManager = new DBManager();
  }

  async initDatabase(): Promise<void> {
    const currentSchemaVersion = this.getKVDao(ConfigDao).get(DB_SCHEMA_VERSION);
    let schemaIsCompatible = !!(typeof currentSchemaVersion === 'number' && currentSchemaVersion === schema.version);
    this.dbManager.initDatabase(schema);
    if (!schemaIsCompatible) {
      await this.dbManager.deleteDatabase();
      this.getKVDao(ConfigDao).remove(LAST_INDEX_TIMESTAMP);
    }
    const db = this.dbManager.getDatabase();
    if (db instanceof DexieDB) {
      db.db.on('ready', () => {
        this.getKVDao(ConfigDao).put(DB_SCHEMA_VERSION, schema.version);
      });
    }
  }

  async openDatabase(): Promise<void> {
    await this.dbManager.openDatabase();
  }

  async closeDatabase(): Promise<void> {
    await this.dbManager.closeDatabase();
  }

  async deleteDatabase(): Promise<void> {
    this.kvStorageManager.clear();
    await this.dbManager.deleteDatabase();
  }

  isDatabaseOpen(): boolean {
    return this.dbManager && this.dbManager.isDatabaseOpen();
  }

  getDao<T extends BaseDao<any>>(DaoClass: Newable<T>): T {
    const database = this.dbManager.getDatabase();
    return this.get(DaoClass, database);
  }

  getKVDao<T extends BaseKVDao>(KVDaoClass: Newable<T>): T {
    const storage = this.kvStorageManager.getStorage();
    return this.get(KVDaoClass, storage);
  }

  async getStorageQuotaOccupation(): Promise<number> {
    let navigator: any = window.navigator;
    if (navigator && navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage / estimate.quota;
    }
    return 0;
  }
}

export default DaoManager;
