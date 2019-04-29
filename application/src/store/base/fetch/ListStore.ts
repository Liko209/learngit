/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:00:44
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, IObservableArray } from 'mobx';
import _ from 'lodash';
import BaseNotificationSubscribe from '@/store/base/BaseNotificationSubscribable';
import { mainLogger } from 'sdk';

export class ListStore<T> extends BaseNotificationSubscribe {
  _items: IObservableArray<T> = observable([], { deep: false });

  @observable
  _hasMoreUp: boolean = false;
  @observable
  _hasMoreDown: boolean = false;

  @action
  append(newItems: T[], inFront: boolean = false) {
    if (newItems.length <= 0) {
      return;
    }

    if (inFront) {
      this._items.unshift(...newItems);
    } else {
      this._items.push(...newItems);
    }
  }

  @action
  replaceAt(index: number, newItem: T) {
    this._items[index] = newItem;
  }

  @action
  replaceAll(newItems: T[]) {
    this._items.replace(newItems);
  }

  @action
  remove(element: T) {
    const index = _(this._items).indexOf(element);
    this.removeAt(index);
  }

  @action
  removeAt(index: number) {
    if (index !== -1) {
      this._items.splice(index, 1);
    }
  }

  @action
  clear() {
    this._items.clear();
  }

  get items(): T[] {
    return this._items;
  }

  get size() {
    return this._items.length;
  }

  first() {
    return this.size > 0 ? this._items[0] : undefined;
  }

  last() {
    return this.size > 0 ? this._items[this.size - 1] : undefined;
  }

  dump(...args: any[]) {
    mainLogger.info(`===> dump: ${JSON.stringify(this._items)}`, args);
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
