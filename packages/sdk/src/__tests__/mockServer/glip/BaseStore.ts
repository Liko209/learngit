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
    item['_id'] = Date.now();
    return this.collection.insert(item);
  }
  delete(id: number): void {
    this.collection.findAndRemove({
      _id: id,
    });
  }
  update(item: Partial<T>): void {
    this.collection.findAndUpdate(
      {
        _id: item.id,
      },
      target => _.defaultsDeep(target, item),
    );
  }
  getById(id: number) {
    return this.collection.findOne({ _id: id });
  }
  getByIds(ids: number[]): T[] {
    return this.collection.find({
      _id: { $in: ids },
    });
  }
  getItems(options: { limit: number; direction: string }): T[] {
    return this.collection.find();
  }
}
