/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import ISortableModel from './ISortableModel';
import FetchDataListHandler, {
  IFetchDataListHandlerOptions,
} from './FetchDataListHandler';

import SortableListStore, { ISortFunc } from './SortableListStore';
import { FetchDataDirection } from './constants';

import { service } from 'sdk';
import { IIncomingData } from '../../store';
import _ from 'lodash';

const { EVENT_TYPES } = service;

export interface IMatchFunc<T> {
  (model: T): boolean;
}

export interface ITransformFunc<T> {
  (model: T): ISortableModel<T>;
}

export interface IFetchSortableDataListHandlerOptions<T>
  extends IFetchDataListHandlerOptions {
  isMatchFunc: IMatchFunc<T>;
  transformFunc: ITransformFunc<T>;
  sortFunc: ISortFunc<ISortableModel<T>>;
  eventName?: string;
}
export interface IFetchSortableDataProvider<T> {
  fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<T> | null,
  ): Promise<T[]>;
}

export default class FetchSortableDataListHandler<
  T
> extends FetchDataListHandler<ISortableModel<T>> {
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
    anchor: ISortableModel<T> | null,
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
  }

  onDataChanged({ type, entities }: IIncomingData<T>) {
    const existKeys = this.sortableListStore.getIds();
    const keys = Array.from(entities.keys());
    const matchedKeys = _.intersection(keys, existKeys);
    const differentKeys = _.difference(keys, existKeys);

    if (type === EVENT_TYPES.DELETE) {
      this.sortableListStore.removeByIds(matchedKeys);
    } else {
      const matchedSortableModels: ISortableModel<T>[] = [];
      const matchedEntities: T[] = [];
      const notMatchedKeys: number[] = [];

      matchedKeys.forEach((key: number) => {
        const model = entities.get(key) as T;
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
      this.sortableListStore.upsert(matchedSortableModels);
    }
  }

  private _isInRange(sortValue: number) {
    let inRange = false;
    const idArray = this.sortableListStore.getItems();
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
