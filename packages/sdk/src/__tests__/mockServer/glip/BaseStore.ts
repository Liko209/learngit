import { IStore } from '../types';
import { ExtendedBaseModel } from 'sdk/module/models/ExtendedBaseModel';
import Loki from 'lokijs';
import _ from 'lodash';
const db = new Loki('glip-mock.json');

export class BaseStore<T extends ExtendedBaseModel<number>>
  implements IStore<number, T> {
  // items: T[] = [];
  collection: Collection<T>;

  constructor(public name: string) {
    this.collection = db.addCollection(name);
  }

  create(item: T) {
    return this.collection.insert({ ...item, _id: Date.now() });
  }
  delete(id: number): void {
    this.collection.findAndRemove({
      _id: id,
    } as any);
  }
  update(item: Partial<T>): void {
    this.collection.findAndUpdate(
      {
        _id: item.id,
      } as any,
      target => _.defaultsDeep(target, item),
    );
  }
  getById(id: number) {
    return this.collection.findOne({ _id: id } as any);
  }
  getByIds(ids: number[]): T[] {
    return this.collection.find({
      _id: { $in: ids },
    } as any);
  }
  getItems(options: { limit: number; direction: string }): T[] {
    return this.collection.find();
  }
}
