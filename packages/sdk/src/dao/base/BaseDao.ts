/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-23 23:29:52
 */
import _ from 'lodash';
import { DexieDB, LokiDB, IDatabaseCollection, IDatabase } from 'foundation';
import Query from './Query';
import { ErrorTypes, Throw } from '../../utils';

class BaseDao<T extends {}> {
  static COLLECTION_NAME: string = '';
  private collection: IDatabaseCollection<T>;
  private db: IDatabase;
  constructor(collectionName: string, db: IDatabase) {
    /**
     * should remove this condition later
     */
    // if (db) {
    this.db = db;
    this.collection = db.getCollection<T>(collectionName);
    // }
  }

  async put(item: T | T[]): Promise<void> {
    if (Array.isArray(item)) {
      await this.bulkPut(item);
    } else {
      this._validateItem(item, true);
      await this.db.ensureDBOpened();
      await this.collection.put(item);
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    array.forEach(item => this._validateItem(item, true));
    await this.db.ensureDBOpened();
    await this.db.getTransaction('rw', [this.collection], async () => {
      this.collection.bulkPut(array);
    });
  }

  async get(key: number): Promise<T | null> {
    this._validateKey(key);
    await this.db.ensureDBOpened();
    return this.collection.get(key);
  }

  async clear(): Promise<void> {
    await this.collection.clear();
  }

  /**
   *
   * @param {*} primaryKey
   * return undefined no matter if a record was deleted or not
   */
  async delete(key: number): Promise<void> {
    this._validateKey(key);
    await this.db.ensureDBOpened();
    await this.collection.delete(key);
  }

  async bulkDelete(keys: number[]): Promise<void> {
    keys.forEach(key => this._validateKey(key));
    await this.db.ensureDBOpened();
    await this.collection.bulkDelete(keys);
  }

  async update(item: Partial<T> | Partial<T>[]): Promise<void> {
    if (Array.isArray(item)) {
      const array = item;
      await this.bulkUpdate(array);
    } else {
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
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    await this.db.ensureDBOpened();
    await this.db.getTransaction('rw', [this.collection], async () => {
      await Promise.all(array.map(item => this.update(item)));
    });
  }

  async getAll(): Promise<T[]> {
    await this.db.ensureDBOpened();
    return this.collection.getAll();
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
  private _validateItem(item: T, withPrimaryKey: boolean): void {
    if (!_.isObjectLike(item)) {
      Throw(ErrorTypes.INVALIDTE_PARAMETERS, `Item should be an object. Received ${item}`);
    }
    if (_.isEmpty(item)) {
      Throw(ErrorTypes.INVALIDTE_PARAMETERS, `Item should not be an empty object.`);
    }
    if (withPrimaryKey && !item[this.collection.primaryKeyName()]) {
      Throw(
        ErrorTypes.INVALIDTE_PARAMETERS,
        `Lack of primary key ${this.collection.primaryKeyName()} in object ${JSON.stringify(item)}`,
      );
    }
  }

  private _validateKey(key: number) {
    if (!_.isInteger(key)) {
      Throw(ErrorTypes.INVALIDTE_PARAMETERS, 'Key for db get method should be an integer.');
    }
  }
}

export default BaseDao;
