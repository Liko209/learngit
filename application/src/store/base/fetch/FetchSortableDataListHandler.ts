/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import {
  handleDelete,
  handleReplace,
  handleReplaceAll,
  handleUpdateAndPut,
  TChangeHandler,
} from './IncomingDataHandler';

import { EVENT_TYPES } from 'sdk/service';
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
import { IIncomingData } from '../../store';
import _ from 'lodash';

export type TReplacedData<T> = {
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
  private _isMatchFunc: IMatchFunc<T | TReplacedData<T>>;
  private _transformFunc: ITransformFunc<T>;
  private _sortableDataProvider: IFetchSortableDataProvider<T>;
  protected _handleIncomingDataByType = {
    [EVENT_TYPES.DELETE]: handleDelete,
    [EVENT_TYPES.REPLACE]: handleReplace,
    [EVENT_TYPES.REPLACE_ALL]: handleReplaceAll,
    [EVENT_TYPES.PUT]: handleUpdateAndPut,
    [EVENT_TYPES.UPDATE]: handleUpdateAndPut,
  };

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

  extractModel(
    entities: Map<number, T | TReplacedData<T>>,
    key: number,
    type: EVENT_TYPES,
  ) {
    let model: T;
    if (type === EVENT_TYPES.REPLACE) {
      model = (entities.get(key) as TReplacedData<T>).data as T;
    } else {
      model = entities.get(key) as T;
    }
    return model;
  }

  onDataChanged({ type, entities }: IIncomingData<T | TReplacedData<T>>) {
    const extractModel = (type: EVENT_TYPES, entity: T | TReplacedData<T>): T =>
      type === EVENT_TYPES.REPLACE
        ? (entity as TReplacedData<T>).data
        : (entity as T);

    const keys = _([...entities.values()])
      .filter(entity => this._isMatchFunc(extractModel(type, entity)))
      .map('id')
      .value();

    const existKeys = this.sortableListStore.getIds();
    const matchedKeys = _.intersection(keys, existKeys);
    const handler = this._handleIncomingDataByType[type] as TChangeHandler<T>;

    const { deleted, updated, updateEntity } = handler(
      matchedKeys,
      entities,
      this._transformFunc,
      this.sortableListStore,
    );

    if (type !== EVENT_TYPES.DELETE) {
      const differentKeys = _.difference(keys, existKeys);
      differentKeys.forEach((key: number) => {
        const model = entities.get(key) as T;
        const sortable = this._transformFunc(model);
        if (this._isInRange(sortable.sortValue)) {
          updated.push(sortable);
          updateEntity.push(model);
        }
      });
    }

    this.updateEntityStore(updateEntity);
    this.sortableListStore.removeByIds(deleted);
    if (type === EVENT_TYPES.REPLACE_ALL) {
      this.sortableListStore.replaceAll(updated);
    } else {
      this.sortableListStore.upInsert(updated);
    }
    this._dataChangeCallBack &&
      this._dataChangeCallBack({
        updated,
        deleted,
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
  protected handlePageData(
    result: ISortableModel[],
    direction: FetchDataDirection,
  ) {
    let inFront = false;
    if (direction === FetchDataDirection.UP) {
      inFront = true;
    }
    const hasMore = result.length >= this._pageSize;
    this.sortableListStore.setHasMore(hasMore, inFront);
    if (result.length > 0) {
      this.sortableListStore.upInsert(result);
    }
  }
}
