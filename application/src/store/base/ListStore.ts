/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:00:44
 * Copyright © RingCentral. All rights reserved.
 */
import { createAtom, IAtom } from 'mobx';
import _, { ListIteratee } from 'lodash';
import BaseNotificationSubscribe from '@/store/base/BaseNotificationSubscribable';

export default class ListStore<T> extends BaseNotificationSubscribe {
  items: T[] = [];
  _hasMore: boolean = true;
  atom: IAtom = createAtom(`list: ${Math.random()}`);

  append(...newItems: T[]) {
    this.items.push(...newItems);
    return this.atom.reportChanged();
  }

  prepend(...newItems: T[]) {
    this.items.unshift(...newItems);
    return this.atom.reportChanged();
  }

  replace(index: number, newItem: T) {
    this.items[index] = newItem;
    return this.atom.reportChanged();
  }
  replaceAll(newItems: T[]) {
    this.items = newItems;
    this.atom.reportChanged();
  }

  delete(predicate?: ListIteratee<T>) {
    _(this.items)
      .remove(predicate)
      .value();
    this.atom.reportChanged();
  }

  clearAll() {
    this.items = [];
    this.atom.reportChanged();
  }

  getItems() {
    this.atom.reportObserved();
    return this.items;
  }

  getSize() {
    return _(this.items).size();
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

  get hasMore() {
    return this._hasMore;
  }
  set hasMore(hasMore: boolean) {
    this._hasMore = hasMore;
  }
}

export { ListStore };
