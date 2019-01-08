/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { transaction } from 'mobx';
import { IdModel } from 'sdk/framework/model';
import { QUERY_DIRECTION } from 'sdk/dao';
import {
  NotificationEntityPayload,
  NotificationEntityUpdatePayload,
  NotificationEntityReplacePayload,
  NotificationEntityDeletePayload,
} from 'sdk/service/notificationCenter';
import { EVENT_TYPES } from 'sdk/service';
import { transform2Map } from '@/store/utils';

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
import { mainLogger } from 'sdk/src';

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
  T extends IdModel
> extends FetchDataListHandler<ISortableModel<T>> {
  private _isMatchFunc: IMatchFunc<T | TReplacedData<T>>;
  private _transformFunc: ITransformFunc<T>;
  private _sortableDataProvider?: IFetchSortableDataProvider<T>;

  constructor(
    dataProvider: IFetchSortableDataProvider<T> | undefined,
    options: IFetchSortableDataListHandlerOptions<T>,
    listStore: SortableListStore<T> = new SortableListStore<T>(options.sortFunc),
  ) {
    super(null, options, listStore);
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
    if (!this._sortableDataProvider) {
      return mainLogger.warn('data fetcher should be defined ');
    }
    const { data, hasMore } = await this._sortableDataProvider.fetchData(
      direction,
      pageSize,
      anchor,
    );
    const sortableResult: ISortableModel<T>[] = [];
    data.forEach((element: T) => {
      sortableResult.push(this._transformFunc(element));
    });
    transaction(() => {
      this.updateEntityStore(data);
      this.handleHasMore(hasMore, direction);
      this.handlePageData(sortableResult);
      this._dataChangeCallBack &&
        this._dataChangeCallBack({
          direction,
          added: sortableResult,
          deleted: [],
        });
    });
    return data;
  }

  handleDataDeleted(payload: NotificationEntityDeletePayload) {
    let originalSortableIds: number[] = [];

    if (this._dataChangeCallBack) {
      originalSortableIds = this.sortableListStore.getIds();
    }

    const deletedSortableModelIds = Array.from(payload.body.ids);
    this.sortableListStore.removeByIds(deletedSortableModelIds);

    if (this._dataChangeCallBack) {
      this._dataChangeCallBack({
        deleted: _.intersection(originalSortableIds, payload.body.ids),
        added: [],
        direction: QUERY_DIRECTION.NEWER,
      });
    }
  }

  handleDataUpdateReplace(
    payload:
      | NotificationEntityUpdatePayload<T>
      | NotificationEntityReplacePayload<T>,
  ) {
    let originalSortableModels: ISortableModel[] = [];
    let deletedSortableModelIds: number[] = [];
    let addedSortableModels: ISortableModel[] = [];

    const entities = payload.body.entities;
    const keys = Array.from(payload.body.ids);

    const existKeys = this.sortableListStore.getIds();
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
        deletedSortableModelIds.push(key);
      }
    });

    if (payload.type === EVENT_TYPES.REPLACE) {
      if (payload.body.isReplaceAll) {
        deletedSortableModelIds = existKeys;
      } else {
        deletedSortableModelIds = matchedKeys;
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

    if (this._dataChangeCallBack) {
      originalSortableModels = _.cloneDeep(this.sortableListStore.items);
    }

    if (payload.type === EVENT_TYPES.REPLACE && payload.body.isReplaceAll) {
      this.replaceEntityStore(matchedEntities);
      this.sortableListStore.removeByIds(deletedSortableModelIds);
      this.sortableListStore.upsert(matchedSortableModels);

      if (this._dataChangeCallBack) {
        // replace models as updated models
        addedSortableModels = matchedSortableModels;
      }
    } else {
      this.updateEntityStore(matchedEntities);
      this.sortableListStore.upsert(matchedSortableModels);
      this.sortableListStore.removeByIds(deletedSortableModelIds);

      if (this._dataChangeCallBack) {
        // calculate added models
        addedSortableModels = _.differenceBy(
          matchedSortableModels,
          originalSortableModels,
          item => item.id,
        );
      }
    }

    this._dataChangeCallBack &&
      this._dataChangeCallBack({
        deleted: deletedSortableModelIds,
        added: addedSortableModels,
        direction: QUERY_DIRECTION.NEWER,
      });
  }

  onDataChanged(payload: NotificationEntityPayload<T>) {
    switch (payload.type) {
      case EVENT_TYPES.DELETE:
        this.handleDataDeleted(payload);
        break;
      case EVENT_TYPES.UPDATE:
      case EVENT_TYPES.REPLACE:
        this.handleDataUpdateReplace(payload);
        break;
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
    this.onDataChanged({
      type: EVENT_TYPES.DELETE,
      body: {
        ids,
      },
    });
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
