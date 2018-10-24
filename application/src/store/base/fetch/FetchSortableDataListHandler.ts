/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import {
  handleDelete,
  handleReplaceAll,
  handleUpsert,
} from './IncomingDataHandler';

import { EVENT_TYPES } from 'sdk/service';
import {
  ISortableModel,
  FetchDataDirection,
  IMatchFunc,
  ITransformFunc,
  ISortFunc,
  TReplacedData,
  TChangeHandler,
} from './types';
import {
  FetchDataListHandler,
  IFetchDataListHandlerOptions,
} from './FetchDataListHandler';

import { SortableListStore } from './SortableListStore';
import { IIncomingData } from '../../store';
import _ from 'lodash';

const transform2Map = (entities: any[]): Map<number, any> => {
  const map = new Map();
  entities.forEach((item: any) => {
    map.set(item.id, item);
  });
  return map;
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
  ): Promise<{ data: T[]; hasMore: boolean }>;
}

export class FetchSortableDataListHandler<T> extends FetchDataListHandler<
  ISortableModel<T>
> {
  private _isMatchFunc: IMatchFunc<T | TReplacedData<T>>;
  private _transformFunc: ITransformFunc<T>;
  private _sortableDataProvider: IFetchSortableDataProvider<T>;
  protected _handleIncomingDataByType = {
    [EVENT_TYPES.DELETE]: handleDelete,
    [EVENT_TYPES.REPLACE]: handleUpsert,
    [EVENT_TYPES.REPLACE_ALL]: handleReplaceAll,
    [EVENT_TYPES.PUT]: handleUpsert,
    [EVENT_TYPES.UPDATE]: handleUpsert,
  };

  constructor(
    dataProvider: IFetchSortableDataProvider<T>,
    options: IFetchSortableDataListHandlerOptions<T>,
  ) {
    super(null, options, new SortableListStore<T>(options.sortFunc));
    this._isMatchFunc = options.isMatchFunc;
    this._transformFunc = options.transformFunc;
    this._sortableDataProvider = dataProvider;
    this._entityName = options.entityName;

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
    const { data, hasMore } = await this._sortableDataProvider.fetchData(
      offset,
      direction,
      pageSize,
      anchor,
    );
    const sortableResult: ISortableModel<T>[] = [];
    data.forEach((element: T) => {
      sortableResult.push(this._transformFunc(element));
    });
    this.updateEntityStore(data);
    this.handleHasMore(hasMore, direction);
    this.handlePageData(sortableResult);
    this._dataChangeCallBack &&
      this._dataChangeCallBack({
        direction,
        added: sortableResult,
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

    const handler = this._handleIncomingDataByType[type] as TChangeHandler<T>;
    // tslint:disable-next-line
    let { deleted, updated, updateEntity, added } = handler(
      keys,
      entities,
      this._transformFunc,
      this.sortableListStore,
    );
    added = _(added)
      .filter(item => this._isInRange(item.sortValue))
      .value();
    this.updateEntityStore(updateEntity);
    this.sortableListStore.removeByIds(deleted);
    updated.forEach(item => {
      this.sortableListStore.replaceAt(item.index, item.value);
    });
    this.sortableListStore.upsert(added);
    this._dataChangeCallBack &&
      this._dataChangeCallBack({
        deleted,
        added,
        updated,
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

  protected handleHasMore(hasMore: boolean, direction: FetchDataDirection) {
    let inFront = false;
    if (direction === FetchDataDirection.UP) {
      inFront = true;
    }
    this.sortableListStore.setHasMore(hasMore, inFront);
  }

  protected handlePageData(result: ISortableModel[]) {
    if (result.length > 0) {
      this.sortableListStore.upsert(result);
    }
  }

  removeByIds(ids: number[]) {
    this.sortableListStore.removeByIds(ids);
  }

  upsert(models: T[]) {
    this.onDataChanged({
      type: EVENT_TYPES.PUT,
      entities: transform2Map(models),
    });
  }

  replaceAll(models: T[]) {
    this.onDataChanged({
      type: EVENT_TYPES.REPLACE_ALL,
      entities: transform2Map(models),
    });
  }
}
