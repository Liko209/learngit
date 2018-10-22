/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-29 00:29:27
 * Copyright © RingCentral. All rights reserved.
 */
import { execQuery } from './queryExecutor';
import Dexie from 'dexie';
import _ from 'lodash';
import { IDatabaseCollection, IQuery, IQueryOption } from '../../db';
class DexieCollection<T> implements IDatabaseCollection<T> {
  private collection: Dexie.Collection<T, number>;
  private table: Dexie.Table<T, number>;
  constructor(dexie: Dexie, name: string) {
    this.table = dexie.table(name);
    this.collection = this.table.toCollection();
  }

  getCollection() {
    return this.collection;
  }

  getTable() {
    return this.table;
  }

  primaryKeyName(): string {
    return (this.table.schema.primKey.keyPath as string) || '';
  }

  async put(item: T): Promise<void> {
    await this.table.put(item);
  }

  async bulkPut(array: T[]): Promise<void> {
    await this.table.bulkPut(array);
  }

  async get(key: number): Promise<T | null> {
    const result = await this.table.get(key);
    if (result) {
      return result;
    }
    return null;
  }

  async delete(key: number): Promise<void> {
    await this.table.delete(key);
  }

  async bulkDelete(array: number[]): Promise<void> {
    await this.table.bulkDelete(array);
  }

  async update(key: number, changes: Partial<T>): Promise<void> {
    await this.table.update(key, changes);
  }

  async clear(): Promise<void> {
    await this.table.clear();
  }

  async getAll(
    query?: IQuery<T>,
    queryOption: IQueryOption = {},
  ): Promise<T[]> {
    const cols: Dexie.Collection[] = execQuery(this.table, query);
    const { sortBy, desc } = queryOption;

    if (cols.length === 0) {
      // empty
      return [];
    }
    if (cols.length === 1) {
      // single query
      const compute = async () => {
        const result: T[] = [];
        await col.each((item: T) => {
          result.push(item);
        });
        return result;
      };

      let col: Dexie.Collection = cols[0];

      if (sortBy) {
        if (typeof sortBy === 'function') {
          const result = await compute();
          const sorted = result.sort(sortBy);
          return desc ? sorted.reverse() : sorted;
        }
        col = desc ? col.reverse() : col;
        const result = await compute();
        const sorted = result.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) {
            return -1;
          }
          if (a[sortBy] > b[sortBy]) {
            return 1;
          }
          return 0;
        });
        return desc ? sorted.reverse() : sorted;
      }
      if (desc) {
        col = col.reverse();
      }
      return compute();
    }

    // has parallel queries
    const result: T[] = [];
    const ids = {};
    const primaryKey = this.primaryKeyName();
    await Promise.all(
      cols.map(c =>
        c.each((item: T) => {
          if (!ids[item[primaryKey]]) {
            ids[item[primaryKey]] = true;
            result.push(item);
          }
        }),
      ),
    );
    return result;
  }

  async count(query?: IQuery<T>): Promise<number> {
    const cols: Dexie.Collection<T, number>[] = execQuery(this.table, query);
    if (cols.length === 1) {
      return cols[0].count();
    }
    return _.sum(await Promise.all(cols.map(col => col.count())));
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

export default DexieCollection;
