/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:49
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { FetchSortableDataListHandler } from './fetch/FetchSortableDataListHandler';
import { ListStore } from './fetch/ListStore';
import { ISortableModel, TDelta, TUpdated } from './fetch/types';
import { IdModel } from 'sdk/framework/model';
import { QUERY_DIRECTION } from 'sdk/dao';

abstract class TransformHandler<T, K extends IdModel> {
  fetchData: (direction: QUERY_DIRECTION, pageSize?: number) => any;

  constructor(
    protected _orderListHandler: FetchSortableDataListHandler<K>,
    public listStore = new ListStore<T>(),
  ) {
    this._orderListHandler.setUpDataChangeCallback(this._modificationHandler);
    this.fetchData = async (...args) => {
      return this._orderListHandler.fetchData(...args);
    };
  }

  hasMore(direction: QUERY_DIRECTION) {
    return this._orderListHandler.hasMore(direction);
  }

  protected get orderListStore() {
    return this._orderListHandler.sortableListStore;
  }

  private _modificationHandler = (delta: TDelta) => {
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
    direction: QUERY_DIRECTION,
    addedItems: ISortableModel[],
  ): any;

  abstract onDeleted(deletedItems: number[]): any;
  abstract onUpdated(updatedIds: TUpdated): any;
  dispose() {
    this._orderListHandler.dispose();
  }
}

export { TransformHandler };
