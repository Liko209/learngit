import { createAtom, IAtom } from 'mobx';
import _, { ValueIteratee } from 'lodash';

export default class ListStore<T> {
  items: T[] = [];
  atom: IAtom;

  constructor(public identifier: ValueIteratee<T>) {
    this.atom = createAtom(`orderList: ${Math.random()}`);
  }

  set(item: T) {
    this.batchSet([item]);
  }

  batchSet(items: T[]) {
    if (!items.length) {
      return;
    }
    const unionAndSortIds = _.unionBy(items, this.items, this.identifier);
    this.items = unionAndSortIds;
    this.atom.reportChanged();
  }

  remove(id: number) {
    _.remove(this.items, this.identifier);
    this.atom.reportChanged();
  }

  batchRemove(ids: number[]) {
    ids.forEach((id: number) => {
      this.remove(id);
    });
  }

  clearAll() {
    this.items = [];
    this.atom.reportChanged();
  }

  getItems() {
    return this.items;
  }

  getIds() {
    this.atom.reportObserved();
    return _(this.items).map('id');
  }

  getSize() {
    return _(this.items).size();
  }

  get(id: number) {
    return _(this.items).find(this.identifier);
  }

  first() {
    return _(this.items).first();
  }

  last() {
    return _(this.items).last();
  }

  dump(...args: any[]) {
    console.log(`===> dump: ${JSON.stringify(this.items)}`, args);
  }
}

export { ListStore };
