/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:00:57
 */
import { DBManager, KVStorageManager, DexieDB, DatabaseType } from 'foundation';
import { BaseDao, BaseKVDao, DBKVDao } from '../framework/dao';
import schema from './schema';
import Manager from '../Manager';
import { INewable } from '../types';
import { SyncUserConfig } from '../module/sync/config';
import { JobSchedulerConfig } from '../framework/utils/jobSchedule/JobSchedulerConfig';
import { AccountGlobalConfig } from '../module/account/config/AccountGlobalConfig';
import { DaoGlobalConfig } from './config';
import { IdModel, ModelIdType } from '../framework/model';

class DaoManager extends Manager<
  BaseDao<IdModel<ModelIdType>, ModelIdType> | BaseKVDao | DBKVDao
> {
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
      if (AccountGlobalConfig.getUserDictionary()) {
        // TODO FIJI-4396
        const synConfig = new SyncUserConfig();
        synConfig.removeLastIndexTimestamp();
        synConfig.removeFetchRemaining();
        synConfig.removeSocketConnectedLocalTime();
        const jobConfig = new JobSchedulerConfig();
        jobConfig.clearFetchDataConfigs();
      }
    }

    const db = this.dbManager.getDatabase();

    if (db instanceof DexieDB) {
      db.db.on('ready', () => {
        DaoGlobalConfig.setDBSchemaVersion(schema.version);
      });
      const isIEOrEdge = /(MSIE|Trident|Edge)/.test(navigator.userAgent);
      if (isIEOrEdge) {
        const BLOCK_MESSAGE_VALUE = 1;
        db.db.on('blocked', () => {
          DaoGlobalConfig.setDBBlockMessageKey(BLOCK_MESSAGE_VALUE);
        });
        window.addEventListener('storage', async (e: any) => {
          if (
            e.key === DaoGlobalConfig.getDBBlockMessageKey() &&
            Number(e.newValue) === BLOCK_MESSAGE_VALUE
          ) {
            DaoGlobalConfig.removeDBBlockMessageKey();
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

  async deleteDatabase(): Promise<void> {
    await this.dbManager.deleteDatabase();
  }

  isDatabaseOpen(): boolean {
    return this.dbManager && this.dbManager.isDatabaseOpen();
  }

  getDao<T extends BaseDao<IdModel<ModelIdType>, ModelIdType>>(
    DaoClass: INewable<T>,
  ): T {
    const database = this.dbManager.getDatabase();
    return this.get(DaoClass, database);
  }

  getKVDao<T extends BaseKVDao>(KVDaoClass: INewable<T>): T {
    const storage = this.kvStorageManager.getStorage();
    return this.get(KVDaoClass, storage);
  }

  getDBKVDao(): DBKVDao {
    const database = this.dbManager.getDatabase();
    return this.get(DBKVDao, database);
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
    const currentSchemaVersion = DaoGlobalConfig.getDBSchemaVersion();
    return (
      typeof currentSchemaVersion === 'number' &&
      currentSchemaVersion === schema.version
    );
  }
}

export default DaoManager;
