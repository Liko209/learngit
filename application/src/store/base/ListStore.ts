/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:00:44
 * Copyright © RingCentral. All rights reserved.
 */
import { createAtom, IAtom } from 'mobx';
import _ from 'lodash';
import BaseNotificationSubscribe from '@/store/base/BaseNotificationSubscribable';

export default class ListStore<T> extends BaseNotificationSubscribe {
  _items: T[] = [];
  _hasMore: boolean = true;
  _atom: IAtom = createAtom(`list: ${Math.random()}`);

  append(newItems: T[], inFront: boolean = false) {
    if (inFront) {
      this._items.unshift(...newItems);
    } else {
      this._items.push(...newItems);
    }
    this._atom.reportChanged();
  }

  replaceAt(index: number, newItem: T) {
    this._items[index] = newItem;
    return this._atom.reportChanged();
  }

  replaceAll(newItems: T[]) {
    this._items = newItems;
    this._atom.reportChanged();
  }

  remove(element: T) {
    const index = this._items.indexOf(element);
    this.removeAt(index);
  }

  removeAt(index: number) {
    if (index !== -1) {
      this._items.splice(index, 1);
    }
    this._atom.reportChanged();
  }

  // delete(predicate?: ListIteratee<T>) {
  //   _(this._items)
  //     .remove(predicate)
  //     .value();
  //   this._atom.reportChanged();
  // }

  clear() {
    this._items = [];
    this._atom.reportChanged();
  }

  getItems() {
    this._atom.reportObserved();
    return this._items;
  }

  getSize() {
    return _(this._items).size();
  }

  first() {
    return _(this._items).first();
  }

  last() {
    return _(this._items).last();
  }

  dump(...args: any[]) {
    console.log(`===> dump: ${JSON.stringify(this._items)}`, args);
  }

  // push(...newItems: T[]) {
  //   this._items.push(...newItems);
  //   this._atom.reportChanged();
  // }

  // append(...newItems: T[]) {
  //   this._items.push(...newItems);
  //   return this._atom.reportChanged();
  // }

  // prepend(...newItems: T[]) {
  //   this._items.unshift(...newItems);
  //   return this._atom.reportChanged();
  // }

  get hasMore() {
    return this._hasMore;
  }
  set hasMore(hasMore: boolean) {
    this._hasMore = hasMore;
  }
}

export { ListStore };
