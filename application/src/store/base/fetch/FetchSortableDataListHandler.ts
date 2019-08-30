/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { transaction, action } from 'mobx';
import { IdModel, ModelIdType } from 'sdk/framework/model';
import { QUERY_DIRECTION, MAINTAIN_DIRECTION } from 'sdk/dao';
import {
  NotificationEntityPayload,
  NotificationEntityUpdatePayload,
  NotificationEntityReplacePayload,
  NotificationEntityDeletePayload,
  NotificationEntityReloadPayload,
} from 'sdk/service/notificationCenter';
import { EVENT_TYPES } from 'sdk/service';
import { transform2Map } from '@/store/utils';
import {
  ISortableModel,
  IMatchFunc,
  ITransformFunc,
  ISortFunc,
  HasMore,
} from './types';
import {
  FetchDataListHandler,
  IFetchDataListHandlerOptions,
  DeltaDataHandler,
} from './FetchDataListHandler';
import { SortableListStore } from './SortableListStore';
import { mainLogger } from 'foundation/log';

type CountChangeCallback = (count: number) => void;

export interface IFetchSortableDataListHandlerOptions<
  Model,
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> extends IFetchDataListHandlerOptions<IdType, SortableModel> {
  isMatchFunc: IMatchFunc<Model, IdType, SortableModel>;
  transformFunc: ITransformFunc<Model, IdType, SortableModel>;
  sortFunc?: ISortFunc<IdType, SortableModel>;
  eventName?: string;
  limit?: number;
  offset?: number;
  maintainDirection?: MAINTAIN_DIRECTION;
}
export interface IFetchSortableDataProvider<
  Model,
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> {
  fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: SortableModel,
    offset?: number,
  ): Promise<{ data: Model[]; hasMore: HasMore | boolean }>;

  totalCount?(): number;
  fetchTotalCount?(): Promise<number>;
}

const LOG_TAG = 'FetchSortableDataListHandler';

export class FetchSortableDataListHandler<
  Model extends IdModel<IdType>,
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> extends FetchDataListHandler<Model, IdType, SortableModel> {
  private _isMatchFunc: IMatchFunc<Model, IdType, SortableModel>;

  private _transformFunc: ITransformFunc<Model, IdType, SortableModel>;
  private _sortFun?: ISortFunc<IdType, SortableModel>;
  private _sortableDataProvider?: IFetchSortableDataProvider<
    Model,
    IdType,
    SortableModel
  >;
  protected _totalCountChangeCallback?: CountChangeCallback;
  private _eventName: string;

  private _maintainMode: boolean = false;
  private _maintainDirection: MAINTAIN_DIRECTION;

  constructor(
    dataProvider:
      | IFetchSortableDataProvider<Model, IdType, SortableModel>
      | undefined,
    options: IFetchSortableDataListHandlerOptions<Model, IdType, SortableModel>,
    listStore: SortableListStore<IdType, SortableModel> = new SortableListStore(
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
    this._eventName = options.eventName || '';
    this._maintainDirection =
      options.maintainDirection || MAINTAIN_DIRECTION.DOWN;

    if (options.eventName) {
      this.subscribeNotification(
        options.eventName,
        (payload: NotificationEntityPayload<Model, IdType>) => {
          this.onDataChanged(payload);
        },
      );
    }
  }

  setTotalCountChangeCallback(cb: CountChangeCallback) {
    this._totalCountChangeCallback = cb;
  }

  get sortableListStore() {
    return this.listStore as SortableListStore<IdType, SortableModel>;
  }

  set maintainMode(mode: boolean) {
    if (this._maintainMode !== mode) {
      mainLogger.tags(LOG_TAG).debug(`change maintain mode, ${mode}`);
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
    offset?: number,
  ) {
    const dataProvider = this._sortableDataProvider;
    if (!dataProvider) {
      mainLogger.tags(LOG_TAG).warn('data fetcher should be defined ');
      return [];
    }
    return this.fetchDataBy(direction, () =>
      dataProvider.fetchData(direction, pageSize, anchor, offset),
    );
  }

  async fetchDataBy(
    direction: QUERY_DIRECTION,
    dataLoader: () => Promise<{
      data: Model[];
      hasMore: HasMore | boolean;
    }>,
  ) {
    const { data = [], hasMore } = await dataLoader();
    const sortableResult: SortableModel[] = [];
    data.forEach((element: Model) => {
      sortableResult.push(this._transformFunc(element));
    });
    transaction(() => {
      this.updateEntityStore(data);
      this.handleHasMore(hasMore, direction);
      this.handlePageData(sortableResult);
      this._dataChangeCallBacks.forEach(
        (callback: DeltaDataHandler<IdType, SortableModel>) => {
          if (callback) {
            callback({
              added: sortableResult,
              updated: [],
              deleted: [],
            });
          }
        },
      );

      if (sortableResult.length) {
        this._releaseDataInMaintainMode();
      }
    });
    return data;
  }
  @action
  refreshData() {
    mainLogger
      .tags(LOG_TAG)
      .debug(`refreshData: ${this.listStore.items.length - this._pageSize}`);
    let sortableResult: SortableModel[];
    if (this.listStore.items.length > this._pageSize) {
      const isMaintainUp = this._maintainDirection === MAINTAIN_DIRECTION.UP;
      const startIndex = isMaintainUp
        ? 0
        : this.listStore.items.length - this._pageSize;
      const endIndex = isMaintainUp
        ? this._pageSize
        : this.listStore.items.length;
      sortableResult = this.listStore.items.slice(startIndex, endIndex);
      this.handleHasMore({ older: true }, QUERY_DIRECTION.OLDER);
      this.sortableListStore.replaceAll(sortableResult);
    } else {
      sortableResult = this.listStore.items;
    }

    !this._maintainMode &&
      this._dataChangeCallBacks.forEach(
        (callback: DeltaDataHandler<IdType, SortableModel>) => {
          if (callback) {
            callback({
              added: sortableResult,
              updated: [],
              deleted: [],
            });
          }
        },
      );
  }

  @action
  handleDataDeleted = (payload: NotificationEntityDeletePayload<IdType>) => {
    let originalSortableIds: IdType[] = [];

    if (this._dataChangeCallBacks.length) {
      originalSortableIds = this.sortableListStore.getIds;
    }

    const deletedSortableModelIds = Array.from(payload.body.ids);
    this.sortableListStore.removeByIds(deletedSortableModelIds);

    this._dataChangeCallBacks.forEach(
      (callback: DeltaDataHandler<IdType, SortableModel>) => {
        if (callback) {
          callback({
            deleted: _.intersection(originalSortableIds, payload.body.ids),
            updated: [],
            added: [],
          });
        }
      },
    );

    this._updateTotalCount();
  };

  @action
  handleDataUpdateReplace = (
    payload:
      | NotificationEntityUpdatePayload<Model, IdType>
      | NotificationEntityReplacePayload<Model, IdType>,
  ) => {
    let originalSortableModels: SortableModel[] = [];
    let deletedSortableModelIds: IdType[] = [];
    let addedSortableModels: SortableModel[] = [];
    let updatedSortableModels: SortableModel[] = [];

    const entities = payload.body.entities;
    const keys = Array.from(payload.body.ids);

    const existKeys = this.sortableListStore.getIds;
    let matchedKeys: IdType[] = _.intersection(keys, existKeys);
    const matchedSortableModels: SortableModel[] = [];
    const matchedEntities: Model[] = [];
    const isReplaceAll =
      payload.type === EVENT_TYPES.REPLACE && payload.body.isReplaceAll;
    const toReplaceEntities: Map<IdType, Model> = new Map();

    if (payload.type === EVENT_TYPES.REPLACE) {
      if (payload.body.isReplaceAll) {
        matchedKeys = keys;
      }
    }
    matchedKeys.forEach((key: IdType) => {
      const model = entities.get(key) as Model;
      const sortableModel = this._transformFunc(model);
      if (this._isMatchFunc(model, sortableModel)) {
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
      const differentKeys: IdType[] = _.difference(keys, existKeys);
      differentKeys.forEach((key: IdType) => {
        const model = entities.get(key) as Model;
        const sortModel = this._transformFunc(model);
        if (this._isMatchFunc(model, sortModel)) {
          const isInRange = this._isInRange(sortModel);
          this._eventName &&
            this._eventName.startsWith('ENTITY.POST') &&
            mainLogger
              .tags(LOG_TAG)
              .info(`${this._eventName}, key:${key}, isInRange:${isInRange}`);
          if (isInRange) {
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
      this._dataChangeCallBacks.forEach(
        (callback: DeltaDataHandler<IdType, SortableModel>) => {
          if (callback) {
            callback({
              deleted: deletedSortableModelIds,
              updated: updatedSortableModels,
              added: addedSortableModels,
            });
          }
        },
      );

      if (addedSortableModels.length) {
        this._releaseDataInMaintainMode();
      }
    }

    if (entities.size > 0) {
      this._updateTotalCount();
    }
  };

  @action
  handleDataReload = (payload: NotificationEntityReloadPayload<IdType>) => {
    mainLogger.tags(LOG_TAG).info('reload foc: ', this._entityName);
    this.sortableListStore.setHasMore(
      this._defaultHasMoreUp,
      QUERY_DIRECTION.OLDER,
    );
    this.sortableListStore.setHasMore(
      this._defaultHasMoreDown,
      QUERY_DIRECTION.NEWER,
    );
    this.handleDataDeleted({
      type: EVENT_TYPES.DELETE,
      body: {
        ids: payload.isReloadAll
          ? this.sortableListStore.getIds
          : payload.body.ids,
      },
    });
    this._defaultHasMoreUp && this.fetchData(QUERY_DIRECTION.OLDER);
    this._defaultHasMoreDown && this.fetchData(QUERY_DIRECTION.NEWER);
  };

  onDataChanged(payload: NotificationEntityPayload<Model, IdType>) {
    switch (payload.type) {
      case EVENT_TYPES.DELETE:
        this.handleDataDeleted(payload);
        break;
      case EVENT_TYPES.UPDATE:
      case EVENT_TYPES.REPLACE:
        this.handleDataUpdateReplace(payload);
        break;
      case EVENT_TYPES.RELOAD:
        this.handleDataReload(payload);
        break;
      default:
        break;
    }
  }

  private _needToCalculateDifference() {
    return this.maintainMode || this._dataChangeCallBacks.length;
  }

  getOldest() {
    return this.sortableListStore.last();
  }

  getNewest() {
    return this.sortableListStore.first();
  }

  private _isInRange(newData: SortableModel) {
    let inRange = false;
    const idArray = this.sortableListStore.items;
    if (idArray && idArray.length > 0) {
      const first = this.getNewest();
      const last = this.getOldest();

      if (first && last) {
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

  @action
  protected handleHasMore(
    hasMore: HasMore | boolean,
    direction: QUERY_DIRECTION,
  ) {
    this.sortableListStore.setHasMore(hasMore, direction);
  }

  protected handlePageData(result: SortableModel[]) {
    if (result.length > 0) {
      this.sortableListStore.upsert(result);
    }
  }

  removeByIds(ids: IdType[]) {
    this.onDataChanged({
      type: EVENT_TYPES.DELETE,
      body: {
        ids,
      },
    });
  }

  upsert(models: Model[]) {
    const entityMap = transform2Map<Model, IdType>(models);
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
    const entityMap = transform2Map<Model, IdType>(models);
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

  setPageSize(pageSize: number) {
    this._pageSize = pageSize;
  }
}
