import _ from 'lodash';
import { BaseModel } from 'sdk/models';
import { service } from 'sdk';

import storeManager from './StoreManager';
import BaseNotificationSubscribable from './BaseNotificationSubscribable';
import OrderListStore from './OrderListStore';
import {
  handleDelete,
  handleReplace,
  handleReplaceAll,
  handleUpdateAndPut,
} from './handleIncomingDataByType';
import {
  IEntity,
  IIDSortKey,
  IIncomingData,
  ISortFunc,
  IHandleIncomingDataByType,
} from '../store';
import { defaultSortFunc } from '../utils';
import { ENTITY_NAME } from '../constants';

const { EVENT_TYPES } = service;
const DEFAULT_PAGE_SIZE = 20;
enum BIND_EVENT {
  'DATA_CHANGE' = 'DATA_CHANGE',
}

export default class OrderListHandler<
  T extends BaseModel,
  K extends IEntity
> extends BaseNotificationSubscribable {
  private _store: OrderListStore;
  private _hasBigger: boolean;
  private _hasSmaller: boolean;
  private _pageSize: number;
  private _isMatchedFunc: Function;
  private _transformFunc: Function;
  private _handleIncomingDataByType: IHandleIncomingDataByType;

  constructor(
    isMatchedFunc: Function,
    transformFunc: Function,
    sortFunc: ISortFunc = defaultSortFunc,
  ) {
    super();
    this._store = new OrderListStore(sortFunc);

    this._hasBigger = false;
    this._hasSmaller = false;
    this._pageSize = DEFAULT_PAGE_SIZE;
    this._isMatchedFunc = isMatchedFunc;
    this._transformFunc = transformFunc;

    this._handleIncomingDataByType = {
      [EVENT_TYPES.DELETE]: handleDelete,
      [EVENT_TYPES.REPLACE]: handleReplace,
      [EVENT_TYPES.REPLACE_ALL]: handleReplaceAll,
      [EVENT_TYPES.PUT]: handleUpdateAndPut,
      [EVENT_TYPES.UPDATE]: handleUpdateAndPut,
    };
  }

  setPageSize(pageSize: number) {
    this._pageSize = pageSize;
  }

  handleIncomingData(
    entityName: ENTITY_NAME,
    { type, entities }: IIncomingData<T>,
  ) {
    if (!entities.size && type !== EVENT_TYPES.REPLACE_ALL) {
      return;
    }
    const existKeys = this._store.getIds();
    const keys = _.map(
      Array.from(entities.values()).filter(entity =>
        this._isMatchedFunc(entity),
      ),
      'id',
    );
    const matchedKeys = _.intersection(keys, existKeys);
    // prettier-ignore
    const { deleted, updated, updateEntity } = this._handleIncomingDataByType[type]<T>(
      matchedKeys,
      entities,
      this._transformFunc,
      this._store,
    );

    if (type !== EVENT_TYPES.DELETE) {
      const differentKeys = _.difference(keys, existKeys);
      differentKeys.forEach((key: number) => {
        const model = entities.get(key) as T;
        const idSortKey = this._transformFunc(model);
        if (this.isInRange(idSortKey.sortKey)) {
          updated.push(idSortKey);
          updateEntity.push(model);
        }
      });
    }

    this.updateEntityStore(entityName, updateEntity);
    this._store.batchRemove(deleted);
    this._store.batchSet(updated);
    this.emit(BIND_EVENT.DATA_CHANGE, { deleted, updated });
    // this._store.dump();
  }

  isInRange(sortKey: number) {
    let inRange = false;
    const idArray = this._store.getIdArray();
    if (idArray && idArray.length > 0) {
      const smallest = idArray[0];
      const biggest = idArray[idArray.length - 1];
      inRange = sortKey >= smallest.sortKey && sortKey <= biggest.sortKey;
      if (!inRange) {
        inRange =
          (sortKey < smallest.sortKey && !this._hasSmaller) ||
          (sortKey > biggest.sortKey && !this._hasBigger);
      }
    } else {
      inRange = !(this._hasBigger && this._hasSmaller);
    }

    return inRange;
  }

  getStore() {
    return this._store;
  }

  handlePageData(
    entityName: ENTITY_NAME,
    dataModels: IEntity[],
    isBigger: boolean,
  ) {
    if (!dataModels.length) {
      return;
    }
    const handledData: IIDSortKey[] = [];
    dataModels.forEach((item, index) => {
      handledData.push(this._transformFunc(item, index));
    });

    if (isBigger) {
      this._hasBigger = dataModels.length >= this._pageSize;
    } else {
      this._hasSmaller = dataModels.length >= this._pageSize;
    }
    this.updateEntityStore(entityName, dataModels);
    this._store.batchSet(handledData);
    // this._store.dump();
  }

  updateEntityStore(entityName: ENTITY_NAME, entities: IEntity[]) {
    if (!entities.length) {
      return;
    }
    storeManager.dispatchUpdatedDataModels(entityName, entities);
  }

  dispose() {
    super.dispose();
  }
}
