/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:50
 * Copyright © RingCentral. All rights reserved.
 */
import { IDatabase, IDatabaseCollection, LokiCollection } from 'foundation/db';
import _ from 'lodash';
import Query from 'sdk/framework/dao/impl/Query';

import { GlipModel } from './types';
import { sanitized } from './utils';

export class GlipBaseDao<T extends GlipModel> {
  db: IDatabase;
  collection: IDatabaseCollection<T, number>;
  readonly modelName: string;
  unique: string;
  constructor(modelName: string, db: IDatabase) {
    this.db = db;
    this.collection = db.getCollection<T, number>(modelName);
    this.modelName = modelName;
    this.unique = this.collection.primaryKeyName();
  }

  createQuery() {
    return new Query<T, number>(this.collection, this.db);
  }

  create(item: T) {
    return sanitized(
      this.lokiCollection.insert({ ...item, [this.unique]: Date.now() }),
    );
  }

  put(item: T) {
    // We must copy input data
    // Because of loki will modify input data reference
    const newItem: T = _.clone(item);
    const unique: string = this.unique;
    const key = newItem[unique];
    const result = this.lokiCollection.find({
      [unique]: key,
    } as any)[0];

    if (result) {
      const { $loki } = result;
      this.lokiCollection.update(_.assign(newItem, { $loki }));
      return sanitized(newItem);
    }
    this.lokiCollection.insert(newItem);
    return sanitized(newItem);
  }

  bulkPut(array: T | T[]) {
    if (!Array.isArray(array)) {
      return this.put(array);
    }
    return array.map((item: T) => this.put(item));
  }

  delete(id: number): void {
    this.lokiCollection.findAndRemove({
      [this.unique]: id,
    } as any);
  }

  update(item: Partial<T>): void {
    this.lokiCollection.findAndUpdate(
      {
        [this.unique]: item[this.unique],
      } as any,
      target => _.defaultsDeep(target, item),
    );
  }

  findOne() {
    return sanitized(this.lokiCollection.findOne());
  }

  find() {
    return sanitized(this.lokiCollection.find());
  }

  getById(id: number) {
    return sanitized(this.lokiCollection.findOne({ [this.unique]: id } as any));
  }

  get lokiCollection() {
    return (this.collection as LokiCollection<T, number>).getCollection();
  }
}
