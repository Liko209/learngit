/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-29 10:12:28
 * Copyright © RingCentral. All rights reserved.
 */
import Loki from 'lokijs';
import { execQuery } from './queryExecutor';
import _ from 'lodash';
import {
  DatabaseKeyType,
  IDatabaseCollection,
  IQuery,
  IQueryOption,
} from '../../db';

/**
 * return every item will has $loki like this
 * { name: 'nello', age: 18, $loki: 1 }
 *  so we must be remove it
 * @param {Object} obj
 * @return {Object}
 */
// function removeLokiId<T>(obj: T): T {
//   const newO: T = _.clone(obj);
//   Reflect.deleteProperty(newO, '$loki');
//   return newO;
// }
class LokiCollection<T extends object, Key extends DatabaseKeyType>
  implements IDatabaseCollection<T, Key> {
  private collection: Loki.Collection<T>;
  constructor(db: Loki, collectionName: string) {
    this.collection = db.getCollection<T>(collectionName);
  }

  getCollection() {
    return this.collection;
  }

  primaryKeys(query?: IQuery<T>): Promise<Key[]> {
    return this.getAll(query).then((result: T[]) =>
      result.map(item => item[this.primaryKeyName()]),
    );
  }

  primaryKeyName(): string {
    return this.collection.uniqueNames[0].toString();
  }

  async put(item: T): Promise<void> {
    // We must copy input data
    // Because of loki will modify input data reference
    const newItem: T = _.clone(item);
    const unique: string = this.primaryKeyName();
    const key = newItem[unique];
    const result = this.collection.find({
      [unique]: key,
    } as any)[0]
    if (result) {
      const { $loki } = result;
      this.collection.update(_.assign(newItem, { $loki }));
    } else {
      this.collection.insert(newItem);
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    await Promise.all(array.map(async (item: T) => this.put(item)));
  }

  async get(key: Key): Promise<T | null> {
    const unique = this.primaryKeyName();
    const result: (T & LokiObj) | void = this.collection.find({
      [unique]: key,
    } as any)[0];
    if (!result) {
      return null;
    }
    const newO: T = _.clone(result);
    delete newO['$loki'];
    return newO;
  }

  async delete(key: Key): Promise<void> {
    const unique = this.primaryKeyName();
    this.collection.findAndRemove({
      [unique]: key,
    } as any);
  }

  async bulkDelete(keyArr: Key[]): Promise<void> {
    keyArr.forEach((key: Key) => {
      this.delete(key);
    });
  }

  async update(key: Key, changes: Partial<T>): Promise<void> {
    const unique = this.primaryKeyName();
    this.collection.findAndUpdate(
      { [unique]: key } as any,
      (oldItem: object) => {
        Object.assign(oldItem, changes);
      },
    );
  }

  async clear(): Promise<void> {
    this.collection.clear();
  }
  async getAll(
    query?: IQuery<T>,
    queryOption: IQueryOption = {},
  ): Promise<T[]> {
    const resultSets = execQuery(this.collection, query);

    let result: T[] = [];
    resultSets.forEach((resultSet: Resultset<T>) => {
      result.push(
        ...resultSet.data({
          removeMeta: true,
        }),
      );
    });

    if (queryOption) {
      if (typeof queryOption.sortBy !== 'string') {
        result = result.sort(queryOption.sortBy);
      } else {
        result = _.sortBy(result, queryOption.sortBy);
      }
      if (queryOption.desc) {
        result.reverse();
      }
    }
    const primaryKey = this.primaryKeyName();
    return _.uniqBy(result, primaryKey);
  }

  async count(query?: IQuery<T>): Promise<number> {
    const cols = execQuery(this.collection, query);
    if (cols.length === 1) {
      return cols[0].count();
    }

    let sum: number = 0;
    for (let i = 0; i < cols.length; i = +1) {
      sum += cols[i].count();
    }
    return sum;
  }

  async first(query?: IQuery<T>): Promise<T> {
    const result = await this.getAll(query);
    return result[0];
  }

  async last(query?: IQuery<T>): Promise<T> {
    const result = await this.getAll(query);
    return result[result.length - 1];
  }
}

export default LokiCollection;
