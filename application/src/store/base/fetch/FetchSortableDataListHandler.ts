/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { transaction, action } from 'mobx';
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
import { ISortableModel, IMatchFunc, ITransformFunc, ISortFunc } from './types';
import {
  FetchDataListHandler,
  IFetchDataListHandlerOptions,
  DeltaDataHandler,
} from './FetchDataListHandler';
import { SortableListStore } from './SortableListStore';
import { mainLogger } from 'sdk';

type CountChangeCallback = (count: number) => void;

export interface IFetchSortableDataListHandlerOptions<
  Model,
  SortableModel extends ISortableModel = ISortableModel
> extends IFetchDataListHandlerOptions {
  isMatchFunc: IMatchFunc<Model>;
  transformFunc: ITransformFunc<Model, SortableModel>;
  sortFunc?: ISortFunc<SortableModel>;
  eventName?: string;
  limit?: number;
}
export interface IFetchSortableDataProvider<
  Model,
  SortableModel extends ISortableModel = ISortableModel
> {
  fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: SortableModel,
  ): Promise<{ data: Model[]; hasMore: boolean }>;

  totalCount?(): number;
  fetchTotalCount?(): Promise<number>;
}

export class FetchSortableDataListHandler<
  Model extends IdModel,
  SortableModel extends ISortableModel = ISortableModel
> extends FetchDataListHandler<SortableModel> {
  private _isMatchFunc: IMatchFunc<Model>;

  private _transformFunc: ITransformFunc<Model, SortableModel>;
  private _sortFun?: ISortFunc<SortableModel>;
  private _sortableDataProvider?: IFetchSortableDataProvider<
    Model,
    SortableModel
  >;
  protected _totalCountChangeCallback?: CountChangeCallback;

  private _maintainMode: boolean = false;

  constructor(
    dataProvider: IFetchSortableDataProvider<Model, SortableModel> | undefined,
    options: IFetchSortableDataListHandlerOptions<Model, SortableModel>,
    listStore: SortableListStore<SortableModel> = new SortableListStore(
      options.sortFunc,
      options.limit,
    ),
  ) {
    super(null, options, listStore);
    this._isMatchFunc = options.isMatchFunc;
    this._transformFunc = options.transformFunc;
    this._sortableDataProvider = dataProvider;
    this._entityName = options.entityName;
    this._sortFun = options.sortFunc;

    if (options.eventName) {
      this.subscribeNotification(options.eventName, ({ type, body }) => {
        this.onDataChanged({ type, body });
      });
    }
  }

  setTotalCountChangeCallback(cb: CountChangeCallback) {
    this._totalCountChangeCallback = cb;
  }

  get sortableListStore() {
    return this.listStore as SortableListStore<SortableModel>;
  }

  set maintainMode(mode: boolean) {
    if (this._maintainMode !== mode) {
      mainLogger.debug(
        `FetchSortableDataListHandler: change maintain mode, ${mode}`,
      );
      this._maintainMode = mode;
      this._releaseDataInMaintainMode();
    }
  }

  get maintainMode() {
    return this._maintainMode;
  }

  async fetchDataByAnchor(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: SortableModel,
  ) {
    return this.fetchDataInternal(direction, pageSize, anchor);
  }

  private _releaseDataInMaintainMode() {
    if (this._maintainMode) {
      this.refreshData();
    }
  }

  protected async fetchDataInternal(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: SortableModel,
  ) {
    if (!this._sortableDataProvider) {
      mainLogger.warn(
        'FetchSortableDataListHandler: data fetcher should be defined ',
      );
      return [];
    }
    const { data = [], hasMore } = await this._sortableDataProvider.fetchData(
      direction,
      pageSize,
      anchor,
    );
    const sortableResult: SortableModel[] = [];
    data.forEach((element: Model) => {
      sortableResult.push(this._transformFunc(element));
    });
    transaction(() => {
      this.updateEntityStore(data);
      this.handleHasMore(hasMore, direction);
      this.handlePageData(sortableResult);
      this._dataChangeCallBacks.forEach((callback: DeltaDataHandler) => {
        if (callback) {
          callback({
            added: sortableResult,
            updated: [],
            deleted: [],
          });
        }
      });

      if (sortableResult.length) {
        this._releaseDataInMaintainMode();
      }
    });
    return data;
  }

  @action
  refreshData() {
    mainLogger.debug(
      `FetchSortableDataListHandler: refreshData: ${this.listStore.items
        .length - this._pageSize}`,
    );
    let sortableResult: SortableModel[];
    if (this.listStore.items.length > this._pageSize) {
      sortableResult = this.listStore.items.slice(
        this.listStore.items.length - this._pageSize,
        this.listStore.items.length,
      );
      this.handleHasMore(true, QUERY_DIRECTION.OLDER);
      this.sortableListStore.replaceAll(sortableResult);
    } else {
      sortableResult = this.listStore.items;
    }

    !this._maintainMode &&
      this._dataChangeCallBacks.forEach((callback: DeltaDataHandler) => {
        if (callback) {
          callback({
            added: sortableResult,
            updated: [],
            deleted: [],
          });
        }
      });
  }

  @action
  handleDataDeleted = (payload: NotificationEntityDeletePayload) => {
    let originalSortableIds: number[] = [];

    if (this._dataChangeCallBacks.length) {
      originalSortableIds = this.sortableListStore.getIds;
    }

    const deletedSortableModelIds = Array.from(payload.body.ids);
    this.sortableListStore.removeByIds(deletedSortableModelIds);

    this._dataChangeCallBacks.forEach((callback: DeltaDataHandler) => {
      if (callback) {
        callback({
          deleted: _.intersection(originalSortableIds, payload.body.ids),
          updated: [],
          added: [],
        });
      }
    });

    this._updateTotalCount();
  }

  @action
  handleDataUpdateReplace = (
    payload:
      | NotificationEntityUpdatePayload<Model>
      | NotificationEntityReplacePayload<Model>,
  ) => {
    let originalSortableModels: SortableModel[] = [];
    let deletedSortableModelIds: number[] = [];
    let addedSortableModels: SortableModel[] = [];
    let updatedSortableModels: SortableModel[] = [];

    const entities = payload.body.entities;
    const keys = Array.from(payload.body.ids);

    const existKeys = this.sortableListStore.getIds;
    let matchedKeys: number[] = _.intersection(keys, existKeys);
    const matchedSortableModels: SortableModel[] = [];
    const matchedEntities: Model[] = [];
    const isReplaceAll =
      payload.type === EVENT_TYPES.REPLACE && payload.body.isReplaceAll;
    const toReplaceEntities: Map<number, Model> = new Map();

    if (payload.type === EVENT_TYPES.REPLACE) {
      if (payload.body.isReplaceAll) {
        matchedKeys = keys;
      }
    }
    matchedKeys.forEach((key: number) => {
      const model = entities.get(key) as Model;
      if (this._isMatchFunc(model)) {
        const sortableModel = this._transformFunc(model);
        if (
          payload.type === EVENT_TYPES.REPLACE ||
          this._isPosChanged(sortableModel)
        ) {
          matchedSortableModels.push(sortableModel);
          matchedEntities.push(model);
          isReplaceAll && toReplaceEntities.set(key, model);
        }
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
        const model = entities.get(key) as Model;
        if (this._isMatchFunc(model)) {
          const sortModel = this._transformFunc(model);
          if (this._isInRange(sortModel)) {
            matchedSortableModels.push(sortModel);
            matchedEntities.push(model);
          }
        }
      });
    }

    if (this._needToCalculateDifference()) {
      originalSortableModels = _.cloneDeep(this.sortableListStore.items);
    }

    if (isReplaceAll) {
      this.replaceEntityStore(toReplaceEntities);
      this.sortableListStore.removeByIds(deletedSortableModelIds);
      this.sortableListStore.upsert(matchedSortableModels);

      if (this._needToCalculateDifference()) {
        // replace models as updated models
        addedSortableModels = matchedSortableModels;
      }
    } else {
      this.updateEntityStore(matchedEntities);
      this.sortableListStore.upsert(matchedSortableModels);
      this.sortableListStore.removeByIds(deletedSortableModelIds);

      if (this._needToCalculateDifference()) {
        // calculate added models
        addedSortableModels = _.differenceBy(
          matchedSortableModels,
          originalSortableModels,
          (item: SortableModel) => item.id,
        );

        updatedSortableModels = _.intersectionBy(
          matchedSortableModels,
          originalSortableModels,
          (item: SortableModel) => item.id,
        );
      }
    }

    if (
      this._needToCalculateDifference() &&
      (deletedSortableModelIds.length ||
        addedSortableModels.length ||
        updatedSortableModels.length)
    ) {
      this._dataChangeCallBacks.forEach((callback: DeltaDataHandler) => {
        if (callback) {
          callback({
            deleted: deletedSortableModelIds,
            updated: updatedSortableModels,
            added: addedSortableModels,
          });
        }
      });

      if (addedSortableModels.length) {
        this._releaseDataInMaintainMode();
      }
    }

    if (entities.size > 0) {
      this._updateTotalCount();
    }
  }

  onDataChanged(payload: NotificationEntityPayload<Model>) {
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

  private _needToCalculateDifference() {
    return this.maintainMode || this._dataChangeCallBacks.length;
  }

  private _isInRange(newData: SortableModel) {
    let inRange = false;
    const idArray = this.sortableListStore.items;
    if (idArray && idArray.length > 0) {
      const first = idArray[0];
      const last = idArray[idArray.length - 1];
      if (this._sortFun) {
        inRange =
          this._sortFun(newData, first) >= 0 &&
          this._sortFun(newData, last) <= 0;
      } else {
        inRange =
          newData.sortValue >= first.sortValue &&
          newData.sortValue <= last.sortValue;
      }

      if (!inRange) {
        if (this._sortFun) {
          inRange =
            (this._sortFun(newData, first) < 0 &&
              !this.hasMore(QUERY_DIRECTION.OLDER)) ||
            (this._sortFun(newData, last) > 0 &&
              !this.hasMore(QUERY_DIRECTION.NEWER));
        } else {
          inRange =
            (newData.sortValue < first.sortValue &&
              !this.hasMore(QUERY_DIRECTION.OLDER)) ||
            (newData.sortValue > last.sortValue &&
              !this.hasMore(QUERY_DIRECTION.NEWER));
        }
      }
    } else {
      inRange = !(
        this.hasMore(QUERY_DIRECTION.NEWER) &&
        this.hasMore(QUERY_DIRECTION.OLDER)
      );
    }
    return inRange;
  }

  private _isPosChanged(newModel: SortableModel) {
    let isPosChanged = false;

    const oldModel = this.sortableListStore.getById(
      newModel.id,
    ) as SortableModel;
    isPosChanged = newModel.sortValue !== oldModel.sortValue;

    if (!isPosChanged && this._sortFun) {
      const currentAllItems = this.sortableListStore.items;
      const pos = currentAllItems.findIndex((value: SortableModel) => {
        return value.id === newModel.id;
      });

      const leftModel = pos - 1 >= 0 ? currentAllItems[pos - 1] : undefined;
      const rightModel =
        pos + 1 < currentAllItems.length ? currentAllItems[pos + 1] : undefined;

      isPosChanged =
        (leftModel && this._sortFun(newModel, leftModel) < 0) || false; // if smaller then left

      isPosChanged = !isPosChanged
        ? (rightModel && this._sortFun(newModel, rightModel) > 0) || false // if bigger then right
        : isPosChanged;
    }

    return isPosChanged;
  }

  protected handleHasMore(hasMore: boolean, direction: QUERY_DIRECTION) {
    let inFront = false;
    if (direction === QUERY_DIRECTION.OLDER) {
      inFront = true;
    }
    this.sortableListStore.setHasMore(hasMore, inFront);
  }

  protected handlePageData(result: SortableModel[]) {
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

  upsert(models: Model[]) {
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

  replaceAll(models: Model[]) {
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

  transform2SortableModel(originalModel: Model) {
    return this._transformFunc(originalModel);
  }

  private async _updateTotalCount() {
    if (
      this._sortableDataProvider &&
      this._sortableDataProvider.fetchTotalCount &&
      this._sortableDataProvider.totalCount &&
      this._totalCountChangeCallback
    ) {
      const oldTotal = this._sortableDataProvider.totalCount();
      const newTotal = await this._sortableDataProvider.fetchTotalCount();
      if (oldTotal !== newTotal) {
        this._totalCountChangeCallback(newTotal);
      }
    }
  }
}
