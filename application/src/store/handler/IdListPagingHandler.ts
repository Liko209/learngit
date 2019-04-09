/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-26 20:19:49
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import {
  FetchSortableDataListHandler,
  IdListPagingDataProvider,
  IEntityDataProvider,
} from '../base/fetch';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { IdModel } from 'sdk/src/framework/model';
import {
  IMatchFunc,
  ISortableModel,
  ISortFunc,
  ITransformFunc,
} from '../base/fetch/types';
import { Entity } from '../store';
import { ENTITY_NAME } from '../constants';

type IdListPaginationOptions<T, K> = {
  eventName: string;
  entityName: ENTITY_NAME;
  entityDataProvider: IEntityDataProvider<T>;
  filterFunc: IMatchFunc<K>;
  transformFunc?: ITransformFunc<T>;
  isMatchFunc?: IMatchFunc<T>;
  sortFunc?: ISortFunc<ISortableModel<T>>;
};

class IdListPaginationHandler<T extends IdModel, K extends Entity> {
  protected _sourceIds: number[];
  private _idsDataProvider: IdListPagingDataProvider<T, K>;
  private _foc: FetchSortableDataListHandler<T>;
  constructor(sourceIds: number[], options: IdListPaginationOptions<T, K>) {
    this._sourceIds = sourceIds;
    this._foc = this.buildFoc(options);
  }

  onSourceIdsChanged(newIds: number[]) {
    this._sourceIds = newIds;
    if (this._sourceIds.length < newIds.length) {
      this._foc.setHasMore(true, QUERY_DIRECTION.NEWER);
    }
    this._idsDataProvider.onSourceIdsChanged(newIds);
  }

  @computed
  get ids(): number[] {
    return this._foc ? this._foc.sortableListStore.getIds : [];
  }

  loadMorePosts(direction: QUERY_DIRECTION, pageSize: number) {
    return this._foc.fetchData(direction, pageSize);
  }

  protected buildFoc(options: IdListPaginationOptions<T, K>) {
    this._idsDataProvider = new IdListPagingDataProvider<T, K>(
      this._sourceIds,
      {
        filterFunc: options.filterFunc,
        entityName: options.entityName,
        eventName: options.eventName,
        entityDataProvider: options.entityDataProvider,
      },
    );

    return new FetchSortableDataListHandler(this._idsDataProvider, {
      isMatchFunc: options.isMatchFunc || this.defaultIsMatchFunc,
      sortFunc: options.sortFunc || this.defaultSortFunc,
      transformFunc: options.transformFunc || this.defaultTransformFunc,
      entityName: options.entityName,
      eventName: options.eventName,
    });
  }

  fetchSortableDataHandler() {
    return this._foc;
  }

  protected defaultIsMatchFunc = (model: T) => {
    return this._sourceIds.includes(model.id);
  }

  protected defaultSortFunc = (
    lhs: ISortableModel<T>,
    rhs: ISortableModel<T>,
  ): number => {
    let lhsPos = -1;
    let rhsPos = -1;

    for (let i = 0; i < this._sourceIds.length; ++i) {
      const id = this._sourceIds[i];
      lhsPos = id === lhs.id ? i : lhsPos;
      rhsPos = id === rhs.id ? i : rhsPos;
      if (lhsPos !== -1 || rhsPos !== -1) {
        break;
      }
    }
    return rhsPos - lhsPos;
  }

  protected defaultTransformFunc = (model: T) => ({
    id: model.id,
    sortValue: this._sourceIds.indexOf(model.id),
  })

  dispose() {
    this._foc && this._foc.dispose();
  }
}

export { IdListPaginationHandler, IdListPaginationOptions };
