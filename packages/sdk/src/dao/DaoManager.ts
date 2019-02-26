/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:00:57
 */
import { DBManager, KVStorageManager, DexieDB, DatabaseType } from 'foundation';
import { BaseDao, BaseKVDao } from '../framework/dao';
import schema from './schema';
import Manager from '../Manager';
import { INewable } from '../types';
import { NewGlobalConfig } from '../service/config/NewGlobalConfig1';
import { AuthGlobalConfig } from '../service/auth/config';
import { AccountUserConfig } from '../service/account/config';
import { NewUserConfig } from '../service/config/NewUserConfig1';

class DaoManager extends Manager<BaseDao<any> | BaseKVDao> {
  private kvStorageManager: KVStorageManager;
  private dbManager: DBManager;

  constructor() {
    super();
    this.kvStorageManager = new KVStorageManager();
    this.dbManager = new DBManager();
  }

  async initDatabase(): Promise<void> {
    const dbType = this.kvStorageManager.isLocalStorageSupported()
      ? DatabaseType.DexieDB
      : DatabaseType.LokiDB;
    this.dbManager.initDatabase(schema, dbType);

    if (!this._isSchemaCompatible()) {
      try {
        await this.dbManager.deleteDatabase();
      } catch (error) {
        this.dbManager.initDatabase(schema, DatabaseType.LokiDB);
        await this.dbManager.deleteDatabase();
      }
      NewGlobalConfig.removeLastIndexTimestamp();
    }

    const db = this.dbManager.getDatabase();

    if (db instanceof DexieDB) {
      db.db.on('ready', () => {
        NewGlobalConfig.setDBSchemaVersion(schema.version);
      });
      const isIEOrEdge = /(MSIE|Trident|Edge)/.test(navigator.userAgent);
      if (isIEOrEdge) {
        const BLOCK_MESSAGE_KEY = 'DB_VERSION_CHANGE';
        const BLOCK_MESSAGE_VALUE = 1;
        db.db.on('blocked', () => {
          NewGlobalConfig.putConfig(BLOCK_MESSAGE_KEY, BLOCK_MESSAGE_VALUE);
        });
        window.addEventListener('storage', async (e: any) => {
          if (
            e.key === NewGlobalConfig.getConfig(BLOCK_MESSAGE_KEY) &&
            Number(e.newValue) === BLOCK_MESSAGE_VALUE
          ) {
            NewGlobalConfig.removeConfig(BLOCK_MESSAGE_KEY);
            await this.dbManager.deleteDatabase();
          }
        });
      }
    }
  }

  async openDatabase(): Promise<void> {
    await this.dbManager.openDatabase();
  }

  async closeDatabase(): Promise<void> {
    await this.dbManager.closeDatabase();
  }

  private _clearLocalStorage() {
    // need to remove last index timestamp or can't sync data when users re-login
    NewGlobalConfig.removeLastIndexTimestamp();
    // need to remove glip token or can't logout
    AuthGlobalConfig.removeGlipToken();
    AuthGlobalConfig.removeRcToken();
    // each module need to remove its user config when users logout
    const accoutUserConfig = new AccountUserConfig();
    accoutUserConfig.clear();
    const userConfig = new NewUserConfig();
    userConfig.clear();
  }

  async deleteDatabase(): Promise<void> {
    this._clearLocalStorage();
    await this.dbManager.deleteDatabase();
  }

  isDatabaseOpen(): boolean {
    return this.dbManager && this.dbManager.isDatabaseOpen();
  }

  getDao<T extends BaseDao<any>>(DaoClass: INewable<T>): T {
    const database = this.dbManager.getDatabase();
    return this.get(DaoClass, database);
  }

  getKVDao<T extends BaseKVDao>(KVDaoClass: INewable<T>): T {
    const storage = this.kvStorageManager.getStorage();
    return this.get(KVDaoClass, storage);
  }

  async getStorageQuotaOccupation(): Promise<number> {
    const navigator: any = window.navigator;
    if (navigator && navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage / estimate.quota;
    }
    return 0;
  }

  private _isSchemaCompatible() {
    const currentSchemaVersion = NewGlobalConfig.getDBSchemaVersion();
    return (
      typeof currentSchemaVersion === 'number' &&
      currentSchemaVersion === schema.version
    );
  }
}

export default DaoManager;
