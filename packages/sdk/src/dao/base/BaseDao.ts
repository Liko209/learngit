/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-23 23:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { DexieDB, LokiDB, IDatabaseCollection, IDatabase } from 'foundation';
import Query from './Query';
import { ErrorTypes, Throw } from '../../utils';
import { errorHandler } from '../errors/handler';

class BaseDao<T extends {}> {
  static COLLECTION_NAME: string = '';
  private collection: IDatabaseCollection<T>;
  private db: IDatabase;
  private _modelName: string;
  constructor(modelName: string, db: IDatabase) {
    this.db = db;
    this.collection = db.getCollection<T>(modelName);
    this._modelName = modelName;
  }

  get modelName(): string {
    return this._modelName;
  }

  async put(item: T | T[]): Promise<void> {
    try {
      if (Array.isArray(item)) {
        await this.bulkPut(item);
      } else {
        this._validateItem(item, true);
        await this.db.ensureDBOpened();
        await this.collection.put(item);
      }
    } catch (err) {
      errorHandler(err);
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    try {
      array.forEach(item => this._validateItem(item, true));
      await this.doInTransaction(async () => {
        this.collection.bulkPut(array);
      });
    } catch (err) {
      errorHandler(err);
    }
  }

  async get(key: number): Promise<T | null> {
    try {
      this._validateKey(key);
      await this.db.ensureDBOpened();
      return this.collection.get(key);
    } catch (err) {
      errorHandler(err);
      return null;
    }
  }

  async batchGet(ids: number[]): Promise<T[]> {
    try {
      await this.db.ensureDBOpened();
      const query = this.createQuery();
      return await query.anyOf('id', ids).toArray();
    } catch (err) {
      errorHandler(err);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      await this.collection.clear();
    } catch (err) {
      errorHandler(err);
    }
  }

  /**
   *
   * @param {*} primaryKey
   * return undefined no matter if a record was deleted or not
   */
  async delete(key: number): Promise<void> {
    try {
      this._validateKey(key);
      await this.db.ensureDBOpened();
      await this.collection.delete(key);
    } catch (err) {
      errorHandler(err);
    }
  }

  async bulkDelete(keys: number[]): Promise<void> {
    try {
      keys.forEach(key => this._validateKey(key));
      await this.db.ensureDBOpened();
      await this.collection.bulkDelete(keys);
    } catch (err) {
      errorHandler(err);
    }
  }

  async update(item: Partial<T> | Partial<T>[]): Promise<void> {
    try {
      if (Array.isArray(item)) {
        const array = item;
        await this.bulkUpdate(array);
      } else {
        this._validateItem(item, true);
        await this.db.ensureDBOpened();
        const primKey = this.collection.primaryKeyName();
        const saved = await this.get(item[primKey]);
        // If item not exists, will put
        if (!saved) {
          await this.put(item as T);
        } else {
          await this.collection.update(item[primKey], item);
        }
      }
    } catch (err) {
      errorHandler(err);
    }
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    try {
      await this.db.ensureDBOpened();
      await this.doInTransaction(async () => {
        await Promise.all(array.map(item => this.update(item)));
      });
    } catch (err) {
      errorHandler(err);
    }
  }

  async getAll(): Promise<T[]> {
    try {
      await this.db.ensureDBOpened();
      return this.collection.getAll();
    } catch (err) {
      errorHandler(err);
      return [];
    }
  }

  async doInTransaction(func: () => {}): Promise<void> {
    await this.db.ensureDBOpened();
    await this.db.getTransaction('rw', [this.collection], async () => {
      await func();
    });
  }

  isDexieDB(): boolean {
    return this.db instanceof DexieDB;
  }

  isLokiDB(): boolean {
    return this.db instanceof LokiDB;
  }

  createQuery() {
    return new Query<T>(this.collection, this.db);
  }

  createEmptyQuery() {
    return new Query(this.collection, this.db).limit(0);
  }
  private _validateItem(item: Partial<T>, withPrimaryKey: boolean): void {
    if (!_.isObjectLike(item)) {
      Throw(
        ErrorTypes.DB_INVALID_USAGE_ERROR,
        `Item should be an object. Received ${item}`,
      );
    }
    if (_.isEmpty(item)) {
      Throw(
        ErrorTypes.DB_INVALID_USAGE_ERROR,
        'Item should not be an empty object.',
      );
    }
    if (withPrimaryKey && !item[this.collection.primaryKeyName()]) {
      Throw(
        ErrorTypes.DB_INVALID_USAGE_ERROR,
        `Lack of primary key ${this.collection.primaryKeyName()} in object ${JSON.stringify(
          item,
        )}`,
      );
    }
  }

  private _validateKey(key: number) {
    if (!_.isInteger(key)) {
      Throw(
        ErrorTypes.DB_INVALID_USAGE_ERROR,
        'Key for db get method should be an integer.',
      );
    }
  }
}

export default BaseDao;
