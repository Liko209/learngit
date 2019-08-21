/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:00:44
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action, IObservableArray } from 'mobx';
import BaseNotificationSubscribe from '@/store/base/BaseNotificationSubscribable';
import { mainLogger } from 'foundation/log';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { HasMore } from './types';

export class ListStore<T> extends BaseNotificationSubscribe {
  _items: IObservableArray<T> = observable([], { deep: false });

  protected _limit?: number;

  @observable
  hasMore = {
    older: false,
    newer: false,
  };

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
    } else if (this._limit) {
      const items =
        newItems.length > this._limit
          ? newItems.slice(0, this._limit)
          : newItems;
      this._items.push(...items);
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
    const replaceItems =
      this._limit && newItems.length > this._limit
        ? newItems.slice(0, this._limit)
        : newItems;
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
    return this.size ? this._items[this.size - 1] : undefined;
  }

  dump(...args: any[]) {
    mainLogger.info(`===> dump: ${JSON.stringify(this._items)}`, args);
  }

  setHasMore(hasMore: boolean | HasMore, direction: QUERY_DIRECTION) {
    switch (typeof hasMore) {
      case 'boolean': {
        this._setHasMore(hasMore, direction);
        break;
      }
      case 'object':
        {
          const _hasMore = {
            older: false,
            newer: false,
            both: false,
            ...hasMore,
          };
          if (direction === QUERY_DIRECTION.BOTH) {
            this._setHasMore(
              _hasMore[QUERY_DIRECTION.OLDER] || false,
              QUERY_DIRECTION.OLDER,
            );
            this._setHasMore(
              _hasMore[QUERY_DIRECTION.NEWER] || false,
              QUERY_DIRECTION.NEWER,
            );
          } else {
            this._setHasMore(_hasMore[direction], direction);
          }
        }
        break;
      default:
        return;
    }
  }

  @action
  private _setHasMore(value: boolean, direction: QUERY_DIRECTION) {
    this.hasMore[direction] = value;
  }
}
