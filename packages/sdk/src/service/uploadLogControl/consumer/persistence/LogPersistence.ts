/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:22:21
 * Copyright © RingCentral. All rights reserved.
 */
import {
  DatabaseType,
  DBManager,
  IDatabase,
  IDatabaseCollection,
  KVStorageManager,
} from 'foundation';
import { configManager } from '../config';
import schema, { TABLE_LOG } from './schema';
import { ILogPersistence, PersistenceLogEntity } from './types';

export class LogPersistence implements ILogPersistence {
  private _kvStorageManager: KVStorageManager;
  private _dbManager: DBManager;
  private _db: IDatabase;
  private _collection: IDatabaseCollection<PersistenceLogEntity>;
  private _isInit: boolean;

  _ensureInit = async () => {
    if (!this._isInit) {
      this._isInit = true;
      this._kvStorageManager = new KVStorageManager();
      this._dbManager = new DBManager();
      const dbType = this._kvStorageManager.isLocalStorageSupported()
        ? DatabaseType.DexieDB
        : DatabaseType.LokiDB;
      this._dbManager.initDatabase(schema, dbType);
      this._db = this._dbManager.getDatabase();
      this._collection = this._db.getCollection<PersistenceLogEntity>(
        TABLE_LOG,
      );
      await this.cleanPersistentWhenReachLimit(
        configManager.getConfig().persistanceLimit,
      );
    }
  }

  put = async (item: PersistenceLogEntity) => {
    await this._ensureInit();
    await this._db.ensureDBOpened();
    await this._collection.put(item);
  }

  bulkPut = async (array: PersistenceLogEntity[]) => {
    await this._ensureInit();
    await this._db.ensureDBOpened();
    await this._collection.bulkPut(array);
  }

  get = async (key: number) => {
    await this._ensureInit();
    await this._db.ensureDBOpened();
    return await this._collection.get(key);
  }

  getAll = async (limit?: number) => {
    await this._ensureInit();
    await this._db.ensureDBOpened();
    const criteria = [];
    limit !== undefined &&
      criteria.push({
        name: 'limit',
        value: limit,
      });
    criteria.push({
      name: 'orderBy',
      value: 'startTime',
      desc: false,
    });
    const array = await this._collection.getAll({
      criteria,
    });
    return array;
  }

  delete = async (item: PersistenceLogEntity) => {
    await this._ensureInit();
    await this._db.ensureDBOpened();
    await this._collection.delete(item.id);
  }

  bulkDelete = async (array: PersistenceLogEntity[]) => {
    await this._ensureInit();
    await this._db.ensureDBOpened();
    await this._collection.bulkDelete(
      array.map((item: PersistenceLogEntity) => {
        return item.id;
      }),
    );
  }

  count = async () => {
    await this._ensureInit();
    await this._db.ensureDBOpened();
    return await this._collection.count();
  }

  cleanPersistentWhenReachLimit = async (maxPersistenceSize: number) => {
    const logs = await this.getAll();
    if (!logs) return;
    let size = 0;
    let halfMaxSizeIndex = -1;
    for (let index = logs.length - 1; index >= 0; index--) {
      const element = logs[index];
      size += element.size || 0;
      if (size > maxPersistenceSize / 2) {
        if (halfMaxSizeIndex === -1) {
          halfMaxSizeIndex = index;
        }
        if (size > maxPersistenceSize) {
          await this.bulkDelete(logs.slice(0, halfMaxSizeIndex + 1));
          break;
        }
      }
    }
  }
}
