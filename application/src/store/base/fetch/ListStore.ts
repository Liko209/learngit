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

  _limit?: number;

  @observable
  _hasMoreUp: boolean = false;
  @observable
  _hasMoreDown: boolean = false;

  constructor(limit?: number) {
    super();
    this._limit = limit;
  }

  @action
  append(newItems: T[], inFront: boolean = false) {
    if (newItems.length <= 0) {
      return;
    }

    if (inFront) {
      this._items.unshift(...newItems);
      if (this._limit && this._items.length > this._limit) {
        this._items.splice(this._limit, this._items.length);
      }
    } else {
      if (this._limit) {
        const items =
          newItems.length > this._limit
            ? newItems.slice(0, this._limit)
            : newItems;
        this._items.push(...items);
      } else {
        this._items.push(...newItems);
      }
    }
  }

  @action
  replaceAt(index: number, newItem: T) {
    this._items[index] = newItem;
  }

  @action
  replaceAll(newItems: T[]) {
    const replaceItems =
      this._limit && newItems.length > this._limit
        ? newItems.slice(0, this._limit)
        : [...newItems];

    if (
      replaceItems.length === this._items.length &&
      _.isEqualWith(replaceItems, this._items, (objValue: T, otherValue: T) => {
        return objValue['id'] === otherValue['id'];
      })
    ) {
      mainLogger.debug(
        'ListStore',
        `updated items.size=${
          replaceItems.length
        }, is same with original items`,
      );
      return;
    }

    this._items.replace(replaceItems);
  }

  @action
  remove(element: T) {
    const index = this._items.indexOf(element);
    if (index !== -1) {
      this._items.splice(index, 1);
    }
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

  get items() {
    return this._items;
  }

  get size() {
    return this._items.length;
  }

  first() {
    return this.size > 0 ? this._items[0] : undefined;
  }

  last() {
    return this.size ? this._items[this.size - 1] : undefined;
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
