import {
  IDatabase,
  IDatabaseCollection,
  LokiCollection,
} from 'foundation/src/db';
import Query from 'sdk/framework/dao/impl/Query';
import { GlipModel } from './types';
import _ from 'lodash';

export class GlipBaseDao<T extends GlipModel> {
  db: IDatabase;
  collection: IDatabaseCollection<T, number>;
  readonly modelName: string;
  unique: string;
  constructor(modelName: string, db: IDatabase) {
    this.db = db;
    if (db) {
      this.collection = db.getCollection<T, number>(modelName);
    }
    this.modelName = modelName;
    this.unique = this.collection.primaryKeyName();
  }

  createQuery() {
    return new Query<T, number>(this.collection, this.db);
  }

  create(item: T) {
    return this.lokiCollection.insert({ ...item, [this.unique]: Date.now() });
  }

  delete(id: number): void {
    this.lokiCollection.findAndRemove({
      [this.unique]: id,
    } as any);
  }

  update(item: Partial<T>): void {
    this.lokiCollection.findAndUpdate(
      {
        [this.unique]: item.id,
      } as any,
      target => _.defaultsDeep(target, item),
    );
  }

  put(item: Partial<T>) {
    const target = this.getById(item[this.unique]);
    if (target) {
      const result = _.defaultsDeep(target, item) as T;
      this.update(_.defaultsDeep(target, item));
      return result;
    }
    return this.create(item as T);
  }

  getById(id: number) {
    return this.lokiCollection.findOne({ [this.unique]: id } as any);
  }

  get lokiCollection() {
    return (this.collection as LokiCollection<T, number>).getCollection();
  }
}
