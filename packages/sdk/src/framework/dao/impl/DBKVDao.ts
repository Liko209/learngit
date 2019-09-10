/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-02 00:05:14
 * Copyright © RingCentral. All rights reserved.
 */

import { IKVDao } from '../interface/IKVDao';
import { IDatabaseCollection, IDatabase } from 'foundation/db';
import { errorHandler } from '../errors/handler';

type DBKeyValue = {
  key: string;
  value: any;
};

const KVTableName = 'userConfigs';

class DBKVDao implements IKVDao {
  private _collection: IDatabaseCollection<DBKeyValue, string>;
  private _db: IDatabase;
  private _KVMap: Map<string, any>;
  constructor(db: IDatabase) {
    this._db = db;
    if (db) {
      this._collection = db.getCollection<DBKeyValue, string>(KVTableName);
    }
    this._KVMap = new Map<string, any>();
  }

  getKey(key: string): string {
    return key;
  }

  async put(key: string, value: any): Promise<void> {
    try {
      await this._db.ensureDBOpened();
      await this._collection.put({ key, value });
      this._KVMap.set(key, value);
    } catch (err) {
      errorHandler(err);
    }
  }

  async get(key: string): Promise<any> {
    if (this._KVMap.has(key)) {
      return this._KVMap.get(key);
    }
    try {
      await this._db.ensureDBOpened();
      const result = await this._collection.get(key);
      const value = result ? result.value : undefined;
      this._KVMap.set(key, value);
      return value;
    } catch (err) {
      errorHandler(err);
      return undefined;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this._db.ensureDBOpened();
      await this._collection.delete(key);
      this._KVMap.delete(key);
    } catch (err) {
      errorHandler(err);
    }
  }

  async clear(): Promise<void> {
    this._KVMap.clear();
    try {
      await this._collection.clear();
    } catch (err) {
      errorHandler(err);
    }
  }
}

export default DBKVDao;
