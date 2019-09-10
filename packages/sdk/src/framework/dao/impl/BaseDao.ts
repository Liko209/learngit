/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-23 23:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  DexieDB,
  LokiDB,
  IDatabaseCollection,
  IDatabase,
} from 'foundation/db';
import { mainLogger } from 'foundation/log';
import Query from './Query';
import { Throw } from '../../../utils';
import { errorHandler } from '../errors/handler';
import { ERROR_CODES_DB } from '../../../error';
import { IDao } from '../interface/IDao';
import { IdModel, ModelIdType } from '../../model';

class BaseDao<T extends IdModel<IdType>, IdType extends ModelIdType = number>
  implements IDao<T, IdType> {
  static COLLECTION_NAME: string = '';
  private collection: IDatabaseCollection<T, IdType>;
  private db: IDatabase;
  private _modelName: string;
  constructor(modelName: string, db: IDatabase) {
    this.db = db;
    if (db) {
      this.collection = db.getCollection<T, IdType>(modelName);
    }

    this._modelName = modelName;
  }

  get modelName(): string {
    return this._modelName;
  }

  getEntityName(): string {
    return this.modelName;
  }
  protected getDb(): IDatabase {
    return this.db;
  }

  async put(item: T): Promise<void> {
    try {
      if (this._isValidateItem(item, true)) {
        await this.db.ensureDBOpened();
        await this.collection.put(item);
      }
    } catch (err) {
      errorHandler(err);
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    try {
      const validArray = array.filter((item: T) =>
        this._isValidateItem(item, true),
      );
      await this.doInTransaction(async () => {
        await this.collection.bulkPut(validArray);
      });
    } catch (err) {
      errorHandler(err);
    }
  }

  async get(key: IdType): Promise<T | null> {
    try {
      this._validateKey(key);
      await this.db.ensureDBOpened();
      return this.collection.get(key);
    } catch (err) {
      errorHandler(err);
      return null;
    }
  }

  async batchGet(ids: IdType[], order?: boolean): Promise<T[]> {
    try {
      const validIds = ids.filter(
        (id: IdType) => id !== undefined && id !== null,
      );
      if (!validIds.length) {
        return [];
      }
      await this.db.ensureDBOpened();
      const query = this.createQuery();

      let entities: T[] = await query.anyOf('id', validIds).toArray();

      if (order) {
        const entitiesMap = new Map<IdType, T>();
        entities.forEach((entity: T) => {
          entitiesMap.set(entity.id, entity);
        });
        entities = [];
        validIds.forEach((id: IdType) => {
          const entity = entitiesMap.get(id);
          if (entity) {
            entities.push(entity);
          }
        });
      }

      return entities;
    } catch (err) {
      errorHandler(err);
      return [];
    }
  }

  async primaryKeys(ids: IdType[]): Promise<IdType[]> {
    try {
      await this.db.ensureDBOpened();
      const query = this.createQuery();
      return await query.anyOf('id', ids).primaryKeys();
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
  async delete(key: IdType): Promise<void> {
    try {
      this._validateKey(key);
      await this.db.ensureDBOpened();
      await this.collection.delete(key);
    } catch (err) {
      errorHandler(err);
    }
  }

  async bulkDelete(keys: IdType[]): Promise<void> {
    try {
      keys.forEach(key => this._validateKey(key));
      await this.db.ensureDBOpened();
      await this.collection.bulkDelete(keys);
    } catch (err) {
      errorHandler(err);
    }
  }

  async update(item: Partial<T>, shouldDoPut: boolean = true): Promise<void> {
    try {
      if (this._isValidateItem(item, true)) {
        await this.db.ensureDBOpened();
        const primaryKeyName = this.collection.primaryKeyName();
        if (shouldDoPut) {
          const saved = await this.get(item[primaryKeyName]);
          // If item not exists, will put
          if (!saved) {
            await this.put(item as T);
          } else {
            await this._update(item, primaryKeyName);
          }
        } else {
          await this._update(item, primaryKeyName);
        }
      }
    } catch (err) {
      errorHandler(err);
    }
  }

  private async _update(item: Partial<T>, primaryKeyName: string) {
    await this.collection.update(item[primaryKeyName], item);
  }

  async bulkUpdate(
    array: Partial<T>[],
    shouldDoPut: boolean = true,
  ): Promise<void> {
    try {
      await this.db.ensureDBOpened();
      const primaryKeyName = this.collection.primaryKeyName();
      if (shouldDoPut) {
        const ids = array.map((iter: Partial<T>) => iter[primaryKeyName]);
        const exists = await this.primaryKeys(ids);
        await this.doInTransaction(async () => {
          if (!exists || exists.length === 0) {
            await this.bulkPut(array as T[]);
          } else if (exists && exists.length === array.length) {
            await Promise.all(
              array.map(item => this._update(item, primaryKeyName)),
            );
          } else if (exists) {
            const idsSet = new Set<IdType>();
            exists.forEach((item: IdType) => {
              idsSet.add(item);
            });

            const updates: Partial<T>[] = [];
            const puts: Partial<T>[] = [];
            array.forEach((item: Partial<T>) => {
              if (idsSet.has(item[primaryKeyName])) {
                updates.push(item);
              } else {
                puts.push(item);
              }
            });

            await Promise.all(
              updates.map(item => this._update(item, primaryKeyName)),
            );
            await this.bulkPut(puts as T[]);
          }
        });
      } else {
        await this.doInTransaction(async () => {
          await Promise.all(
            array.map(item => this._update(item, primaryKeyName)),
          );
        });
      }
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

  async getAllCount(): Promise<number> {
    return this.createQuery().count();
  }

  async getTotalCount(): Promise<number> {
    return await this.getAllCount();
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
    return new Query<T, IdType>(this.collection, this.db);
  }

  createEmptyQuery() {
    return new Query(this.collection, this.db).limit(0);
  }
  private _isValidateItem(item: Partial<T>, withPrimaryKey: boolean): boolean {
    if (!_.isObjectLike(item)) {
      mainLogger.warn(`Item should be an object. Received ${item}`);
      return false;
    }
    if (_.isEmpty(item)) {
      mainLogger.warn('Item should not be an empty object.');
      return false;
    }
    if (withPrimaryKey && !item[this.collection.primaryKeyName()]) {
      mainLogger.warn(
        `Lack of primary key ${this.collection.primaryKeyName()} in object ${JSON.stringify(
          item,
        )}`,
      );
      return false;
    }
    return true;
  }

  private _validateKey(key: IdType) {
    if (!_.isInteger(key) && !_.isString(key)) {
      Throw(
        ERROR_CODES_DB.INVALID_USAGE_ERROR,
        `Key for db get method should be an integer or string. ${key}`,
      );
    }
  }
}

export default BaseDao;
