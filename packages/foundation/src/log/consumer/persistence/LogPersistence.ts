/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:22:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogPersistence, PersistenceLogEntity } from './types';
import { DBManager, KVStorageManager, DatabaseType, IDatabase, IDatabaseCollection } from '../../../db';
import schema, { TABLE_LOG } from './schema';
export class LogPersistence implements ILogPersistence {
  private _kvStorageManager: KVStorageManager;
  private _dbManager: DBManager;
  private _db: IDatabase;
  private _collection: IDatabaseCollection<PersistenceLogEntity, number>;

  constructor() {
    this._kvStorageManager = new KVStorageManager();
    this._dbManager = new DBManager();
  }

  init = async () => {
    const dbType = this._kvStorageManager.isLocalStorageSupported() ? DatabaseType.DexieDB : DatabaseType.LokiDB;
    this._dbManager.initDatabase(schema, dbType);
    this._db = this._dbManager.getDatabase();
    this._collection = this._db.getCollection<PersistenceLogEntity, number>(TABLE_LOG);
  }

  put = async (item: PersistenceLogEntity) => {
    await this._db.ensureDBOpened();
    await this._collection.put(item);
  }

  bulkPut = async (array: PersistenceLogEntity[]) => {
    await this._db.ensureDBOpened();
    await this._collection.bulkPut(array);
  }

  get = async (key: number) => {
    await this._db.ensureDBOpened();
    return await this._collection.get(key);
  }

  getAll = async (limit: number) => {
    await this._db.ensureDBOpened();
    const array = await this._collection.getAll({
      criteria: [
        {
          name: 'limit',
          value: limit,
        },
        {
          name: 'orderBy',
          value: 'startTime',
          desc: false,
        },
      ],
    });
    return array;
  }

  delete = async (item: PersistenceLogEntity) => {
    await this._db.ensureDBOpened();
    await this._collection.delete(item.id);
  }

  bulkDelete = async (array: PersistenceLogEntity[]) => {
    await this._db.ensureDBOpened();
    await this._collection.bulkDelete(array.map((item) => {
      return item.id;
    }));
  }

  count = async () => {
    await this._db.ensureDBOpened();
    return await this._collection.count();
  }

}
