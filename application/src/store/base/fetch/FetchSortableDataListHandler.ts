/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ISortableModel,
  FetchDataDirection,
  IMatchFunc,
  ITransformFunc,
  ISortFunc,
} from './types';
import {
  FetchDataListHandler,
  IFetchDataListHandlerOptions,
} from './FetchDataListHandler';

import { SortableListStore } from './SortableListStore';

import { service } from 'sdk';
import { IIncomingData } from '../../store';
import _ from 'lodash';

const { EVENT_TYPES } = service;
type TReplacedData<T> = {
  id: number;
  data: T;
};
export interface IFetchSortableDataListHandlerOptions<T>
  extends IFetchDataListHandlerOptions {
  isMatchFunc: IMatchFunc<T>;
  transformFunc: ITransformFunc<T>;
  sortFunc?: ISortFunc<ISortableModel<T>>;
  eventName?: string;
}
export interface IFetchSortableDataProvider<T> {
  fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor?: ISortableModel<T>,
  ): Promise<T[]>;
}

export class FetchSortableDataListHandler<T> extends FetchDataListHandler<
  ISortableModel<T>
> {
  private _isMatchFunc: IMatchFunc<T>;
  private _transformFunc: ITransformFunc<T>;
  private _sortableDataProvider: IFetchSortableDataProvider<T>;

  constructor(
    dataProvider: IFetchSortableDataProvider<T>,
    options: IFetchSortableDataListHandlerOptions<T>,
  ) {
    super(null, options, new SortableListStore<T>(options.sortFunc));
    this._isMatchFunc = options.isMatchFunc;
    this._transformFunc = options.transformFunc;
    this._sortableDataProvider = dataProvider;

    if (options.eventName) {
      this.subscribeNotification(options.eventName, ({ type, entities }) => {
        this.onDataChanged({ type, entities });
      });
    }
  }

  get sortableListStore() {
    return this.listStore as SortableListStore<T>;
  }

  protected async fetchDataInternal(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<T>,
  ) {
    const result = await this._sortableDataProvider.fetchData(
      offset,
      direction,
      pageSize,
      anchor,
    );
    const sortableResult: ISortableModel<T>[] = [];
    result.forEach((element: T) => {
      sortableResult.push(this._transformFunc(element));
    });
    this.updateEntityStore(result);
    this.handlePageData(sortableResult, direction);
    this._dataChangeCallBack &&
      this._dataChangeCallBack({
        direction,
        updated: sortableResult,
        deleted: [],
      });
  }

  onDataChanged({ type, entities }: IIncomingData<T | TReplacedData<T>>) {
    const keys = Array.from(entities.keys());
    const matchedSortableModels: ISortableModel<T>[] = [];
    const matchedEntities: T[] = [];
    const notMatchedKeys: number[] = [];

    if (type === EVENT_TYPES.DELETE) {
      this.sortableListStore.removeByIds(keys);
      notMatchedKeys.push(...keys);
    } else {
      const existKeys = this.sortableListStore.getIds();
      let matchedKeys: number[] = [];
      let differentKeys: number[] = [];
      if (type === EVENT_TYPES.REPLACE_ALL) {
        matchedKeys = keys;
        this.sortableListStore.clear();
      } else {
        matchedKeys = _.intersection(keys, existKeys);
        differentKeys = _.difference(keys, existKeys);
      }

      matchedKeys.forEach((key: number) => {
        let model: T;
        if (type === EVENT_TYPES.REPLACE) {
          model = (entities.get(key) as TReplacedData<T>).data as T;
        } else {
          model = entities.get(key) as T;
        }
        if (this._isMatchFunc(model)) {
          const sortableModel = this._transformFunc(model);
          matchedSortableModels.push(sortableModel);
          matchedEntities.push(model);
        } else {
          notMatchedKeys.push(key);
        }
      });

      differentKeys.forEach((key: number) => {
        const model = entities.get(key) as T;
        if (this._isMatchFunc(model)) {
          const idSortKey = this._transformFunc(model);
          if (this._isInRange(idSortKey.sortValue)) {
            matchedSortableModels.push(idSortKey);
            matchedEntities.push(model);
          }
        }
      });
      this.updateEntityStore(matchedEntities);
      this.sortableListStore.removeByIds(notMatchedKeys);

      if (type === EVENT_TYPES.REPLACE) {
        notMatchedKeys.push(...keys);
        this.sortableListStore.removeByIds(keys);
      }

      if (type === EVENT_TYPES.REPLACE_ALL) {
        this.sortableListStore.replaceAll(matchedSortableModels);
      } else {
        this.sortableListStore.upInsert(matchedSortableModels);
      }
    }
    this._dataChangeCallBack &&
      this._dataChangeCallBack({
        updated: matchedSortableModels,
        deleted: notMatchedKeys,
        direction: FetchDataDirection.DOWN,
      });
  }

  private _isInRange(sortValue: number) {
    let inRange = false;
    const idArray = this.sortableListStore.items;
    if (idArray && idArray.length > 0) {
      const smallest = idArray[0];
      const biggest = idArray[idArray.length - 1];
      inRange =
        sortValue >= smallest.sortValue && sortValue <= biggest.sortValue;
      if (!inRange) {
        inRange =
          (sortValue < smallest.sortValue &&
            !this.hasMore(FetchDataDirection.UP)) ||
          (sortValue > biggest.sortValue &&
            !this.hasMore(FetchDataDirection.DOWN));
      }
    } else {
      inRange = !(
        this.hasMore(FetchDataDirection.DOWN) &&
        this.hasMore(FetchDataDirection.UP)
      );
    }
    return inRange;
  }
}
