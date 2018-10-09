import { observable, action } from 'mobx';
/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:00:44
 * Copyright © RingCentral. All rights reserved.
 */
import { createAtom, IAtom } from 'mobx';
import _, { ListIteratee } from 'lodash';
import BaseNotificationSubscribe from '@/store/base/BaseNotificationSubscribable';

export class ListStore<T> extends BaseNotificationSubscribe {
  _items: T[] = [];

  @observable
  _hasMoreUp: boolean = false;
  @observable
  _hasMoreDown: boolean = false;

  _atom: IAtom = createAtom(`list: ${Math.random()}`);

  append(newItems: T[], inFront: boolean = false) {
    if (newItems.length <= 0) {
      return;
    }

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
    const index = _(this._items).indexOf(element);
    this.removeAt(index);
  }

  removeAt(index: number) {
    if (index !== -1) {
      this._items.splice(index, 1);
      this._atom.reportChanged();
    }
  }

  delete(predicate?: ListIteratee<T>) {
    _(this._items)
      .remove(predicate)
      .value();
    this._atom.reportChanged();
  }

  clear() {
    this._items = [];
    this._atom.reportChanged();
  }

  get items() {
    this._atom.reportObserved();
    return this._items;
  }

  get size() {
    return _(this._items).size();
  }

  first() {
    const item = _(this._items).first();
    this._atom.reportObserved();
    return item;
  }

  last() {
    const item = _(this._items).last();
    this._atom.reportObserved();
    return item;
  }

  dump(...args: any[]) {
    console.log(`===> dump: ${JSON.stringify(this._items)}`, args);
  }

  @action
  setHasMore(value: boolean, up?: boolean) {
    if (up) {
      this._hasMoreUp = value;
    } else {
      this._hasMoreDown = value;
    }
  }
}
