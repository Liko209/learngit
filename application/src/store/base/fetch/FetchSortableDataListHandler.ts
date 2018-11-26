/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseModel } from 'sdk/models';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';

import { EVENT_TYPES } from 'sdk/service';
import {
  ISortableModel,
  IMatchFunc,
  ITransformFunc,
  ISortFunc,
  TReplacedData,
} from './types';
import {
  FetchDataListHandler,
  IFetchDataListHandlerOptions,
} from './FetchDataListHandler';

import { SortableListStore } from './SortableListStore';
import _ from 'lodash';
import { transform2Map } from '@/store/utils';
import { QUERY_DIRECTION } from 'sdk/dao';

export interface IFetchSortableDataListHandlerOptions<T>
  extends IFetchDataListHandlerOptions {
  isMatchFunc: IMatchFunc<T>;
  transformFunc: ITransformFunc<T>;
  sortFunc?: ISortFunc<ISortableModel<T>>;
  eventName?: string;
}
export interface IFetchSortableDataProvider<T> {
  fetchData(
    direction: QUERY_DIRECTION,
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
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor: ISortableModel<T>,
  ) {
    const { data, hasMore } = await this._sortableDataProvider.fetchData(
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
    return data;
  }

  onDataChanged(payload: NotificationEntityPayload<T>) {
    if (EVENT_TYPES.DELETE === payload.type) {
      const keys = Array.from(payload.body.ids);
      this.sortableListStore.removeByIds(keys);
    } else {
      let entities: Map<number, T>;
      let keys: number[] = [];

      if (
        EVENT_TYPES.UPDATE === payload.type ||
        EVENT_TYPES.REPLACE === payload.type
      ) {
        entities = payload.body.entities;
        keys = Array.from(payload.body.ids);
      }

      const existKeys = this.sortableListStore.getIds();
      let notMatchedKeys: number[] = [];
      let matchedKeys: number[] = _.intersection(keys, existKeys);
      const matchedSortableModels: ISortableModel<T>[] = [];
      const matchedEntities: T[] = [];

      if (payload.type === EVENT_TYPES.REPLACE) {
        if (payload.body.isReplaceAll) {
          matchedKeys = keys;
        }
      }
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

      if (payload.type === EVENT_TYPES.REPLACE) {
        if (payload.body.isReplaceAll) {
          notMatchedKeys = existKeys;
        } else {
          notMatchedKeys = matchedKeys;
        }
      } else {
        const differentKeys: number[] = _.difference(keys, existKeys);
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
      }

      if (payload.type === EVENT_TYPES.REPLACE && payload.body.isReplaceAll) {
        this.replaceEntityStore(matchedEntities);
        this.sortableListStore.removeByIds(notMatchedKeys);
        this.sortableListStore.upsert(matchedSortableModels);
      } else {
        this.updateEntityStore(matchedEntities);
        this.sortableListStore.upsert(matchedSortableModels);
        this.sortableListStore.removeByIds(notMatchedKeys);
      }

      this._dataChangeCallBack &&
        this._dataChangeCallBack({
          deleted: notMatchedKeys,
          added: [],
          updated: [],
          direction: QUERY_DIRECTION.NEWER,
        });
    }
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
            !this.hasMore(QUERY_DIRECTION.OLDER)) ||
          (sortValue > biggest.sortValue &&
            !this.hasMore(QUERY_DIRECTION.NEWER));
      }
    } else {
      inRange = !(
        this.hasMore(QUERY_DIRECTION.NEWER) &&
        this.hasMore(QUERY_DIRECTION.OLDER)
      );
    }
    return inRange;
  }

  protected handleHasMore(hasMore: boolean, direction: QUERY_DIRECTION) {
    let inFront = false;
    if (direction === QUERY_DIRECTION.OLDER) {
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
    const entityMap = transform2Map(models);
    const notificationBody = {
      ids: Array.from(entityMap.keys()),
      entities: entityMap,
    };

    this.onDataChanged({
      type: EVENT_TYPES.UPDATE,
      body: notificationBody,
    });
  }

  replaceAll(models: T[]) {
    const entityMap = transform2Map(models);
    const notificationBody = {
      ids: Array.from(entityMap.keys()),
      entities: entityMap,
      isReplaceAll: true,
    };

    this.onDataChanged({
      type: EVENT_TYPES.REPLACE,
      body: notificationBody,
    });
  }
}
