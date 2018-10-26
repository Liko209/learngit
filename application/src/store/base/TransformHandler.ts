/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:49
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { FetchSortableDataListHandler } from './fetch/FetchSortableDataListHandler';
import { ListStore } from './fetch/ListStore';
import {
  FetchDataDirection,
  ISortableModel,
  TDelta,
  TUpdated,
} from './fetch/types';

abstract class TransformHandler<T, K> {
  fetchData: (direction: FetchDataDirection) => any;
  hasMore: (direction: FetchDataDirection) => boolean;
  constructor(
    protected _orderListHandler: FetchSortableDataListHandler<K>,
    public listStore = new ListStore<T>(),
  ) {
    this._orderListHandler.setUpDataChangeCallback(this.modificationHandler);
    this.fetchData = async (...args) => {
      await this._orderListHandler.fetchData(...args);
    };
    this.hasMore = this._orderListHandler.hasMore.bind(_orderListHandler);
  }

  get orderListStore() {
    return this._orderListHandler.sortableListStore;
  }

  modificationHandler = (delta: TDelta) => {
    const { updated, deleted, added, direction } = delta;
    if (deleted.length) {
      this.onDeleted(deleted);
    }
    if (added.length) {
      this.onAdded(direction, added);
    }
    if (updated) {
      this.onUpdated(updated);
    }
  }

  abstract onAdded(
    direction: FetchDataDirection,
    addedItems: ISortableModel[],
  ): any;

  abstract onDeleted(deletedItems: number[]): any;
  abstract onUpdated(updatedIds: TUpdated): any;
  dispose() {
    this._orderListHandler.dispose();
  }
}

export { TransformHandler };
