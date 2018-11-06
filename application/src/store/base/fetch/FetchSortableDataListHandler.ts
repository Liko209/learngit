/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseModel } from 'sdk/models';
import { handleDelete, handleUpsert } from './IncomingDataHandler';

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
import { IncomingData } from '../../store';
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

export class FetchSortableDataListHandler<
  T extends BaseModel
> extends FetchDataListHandler<ISortableModel<T>> {
  private _isMatchFunc: IMatchFunc<T | TReplacedData<T>>;
  private _transformFunc: ITransformFunc<T>;
  private _sortableDataProvider: IFetchSortableDataProvider<T>;
  protected _handleIncomingDataByType = {
    [EVENT_TYPES.DELETE]: handleDelete,
    [EVENT_TYPES.REPLACE]: handleUpsert,
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
      this.subscribeNotification(options.eventName, ({ type, body }) => {
        this.onDataChanged({ type, body });
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

  onDataChanged({ type, body }: IncomingData<T>) {
    let keys: number[] = [];
    let entities: Map<number, T | TReplacedData<T>> = new Map();
    switch (type) {
      case EVENT_TYPES.DELETE: {
        keys = body as number[];
        break;
      }
      case EVENT_TYPES.UPDATE: {
        entities = (body as {
          entities: Map<number, T>;
          partials: Map<number, T> | null;
        }).entities;
        keys = _([...entities.values()])
          .filter(entity => this._isMatchFunc(entity))
          .map('id')
          .value();
        break;
      }
      case EVENT_TYPES.REPLACE: {
        (body as {
          id: number;
          entity: T;
        }[]).forEach(({ id, entity: data }) => {
          entities.set(data.id, { id, data });
        });
        keys = _([...(entities as Map<number, TReplacedData<T>>).values()])
          .filter(entity => this._isMatchFunc(entity.data))
          .map('id')
          .value();
        break;
      }
    }

    const handler = this._handleIncomingDataByType[type] as TChangeHandler<T>;
    // tslint:disable-next-line
    let { deleted, updated, added, updateEntity } = handler(
      keys,
      entities,
      this._transformFunc,
      this.sortableListStore,
    );
    added = _(added)
      .filter(item => this._isInRange(item.sortValue))
      .value();
    if (EVENT_TYPES.UPDATE === type) {
      this.updateEntityStore(updateEntity);
    }
    this.sortableListStore.removeByIds(deleted);
    updated &&
      updated.forEach((item: any) => {
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
      type: EVENT_TYPES.UPDATE,
      body: {
        entities: transform2Map(models),
        partials: null,
      },
    });
  }
}
