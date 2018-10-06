/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-06 19:14:28
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { BaseModel } from 'sdk/models';
import { service } from 'sdk';

import storeManager from './StoreManager';
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
import { StoreViewModel } from '../ViewModel';

const { EVENT_TYPES } = service;
const DEFAULT_PAGE_SIZE = 20;
enum BIND_EVENT {
  'DATA_CHANGE' = 'DATA_CHANGE',
}
enum DIRECTION {
  'OLDER' = 'older',
  'NEWER' = 'newer',
}
export default class OrderListHandler<
  T extends BaseModel,
  K extends IEntity
> extends StoreViewModel {
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
    { type, entities }: IIncomingData<T | { id: number; data: T }>,
  ) {
    if (!entities.size && type !== EVENT_TYPES.REPLACE_ALL) {
      return;
    }
    const existKeys = this._store.getIds();
    const keys = _.map(
      Array.from(entities.values()).filter(
        entity =>
          type === EVENT_TYPES.DELETE ||
          this._isMatchedFunc(
            type === EVENT_TYPES.REPLACE
              ? (entity as { id: number; data: T }).data
              : entity,
          ),
      ),
      'id',
    );
    const matchedKeys = _.intersection(keys, existKeys);
    // prettier-ignore
    const { deleted, updated, updateEntity } = this._handleIncomingDataByType[type]<T | { id: number; data: T; }>(
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
    this.emit(BIND_EVENT.DATA_CHANGE, {
      deleted,
      updated,
      direction: DIRECTION.NEWER,
    });
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
    this.emit(BIND_EVENT.DATA_CHANGE, {
      updated: handledData,
      deleted: [],
      // TODO: scroll up and scroll down
      direction: DIRECTION.OLDER,
    });
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

export { BIND_EVENT, OrderListHandler, DIRECTION };
