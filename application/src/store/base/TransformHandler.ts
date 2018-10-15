import { ListStore } from './fetch/ListStore';
import { FetchDataDirection, ISortableModel, TDelta } from './fetch/types';
/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:49
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { FetchSortableDataListHandler } from './fetch/FetchSortableDataListHandler';

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
    const { updated, deleted, direction } = delta;
    if (deleted.length) {
      this.onDeleted(deleted);
    }
    if (updated.length) {
      this.onAdded(direction, updated);
    }
  }

  abstract onAdded(
    direction: FetchDataDirection,
    addedItems: ISortableModel[],
  ): any;

  abstract onDeleted(deletedItems: number[]): any;

  dispose() {
    this.orderListStore.dispose();
  }
}

export { TransformHandler };
