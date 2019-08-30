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
  ISortableModel,
} from '../base/fetch';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { IdModel, ModelIdType } from 'sdk/framework/model';
import { IMatchFunc, ISortFunc, ITransformFunc } from '../base/fetch/types';
import { Entity } from '../store';
import { ENTITY_NAME } from '../constants';

type IdListPaginationOptions<T, K, IdType extends ModelIdType = number> = {
  eventName: string;
  entityName: ENTITY_NAME;
  entityDataProvider: IEntityDataProvider<T, IdType>;
  filterFunc: IMatchFunc<K>;
  transformFunc?: ITransformFunc<T, IdType>;
  isMatchFunc?: IMatchFunc<T, IdType>;
  sortFunc?: ISortFunc<IdType>;
  defaultHasMoreUp?: boolean;
  defaultHasMoreDown?: boolean;
  pageSize?: number;
};

class IdListPaginationHandler<
  T extends IdModel<IdType>,
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
> {
  protected _sourceIds: IdType[];
  private _idsDataProvider: IdListPagingDataProvider<T, K, IdType>;
  private _foc: FetchSortableDataListHandler<T, IdType>;
  constructor(
    sourceIds: IdType[],
    options: IdListPaginationOptions<T, K, IdType>,
  ) {
    this._sourceIds = sourceIds;
    this._foc = this.buildFoc(options);
  }

  onSourceIdsChanged(newIds: IdType[]) {
    this._sourceIds = newIds;
    if (this._sourceIds.length < newIds.length) {
      this._foc.setHasMore(true, QUERY_DIRECTION.NEWER);
    }
    this._idsDataProvider.onSourceIdsChanged(newIds);
  }

  @computed
  get ids(): IdType[] {
    return this._foc ? this._foc.sortableListStore.getIds : [];
  }

  loadMorePosts(direction: QUERY_DIRECTION, pageSize: number) {
    return this._foc.fetchData(direction, pageSize);
  }

  protected buildFoc(options: IdListPaginationOptions<T, K, IdType>) {
    this._idsDataProvider = new IdListPagingDataProvider<T, K, IdType>(
      this._sourceIds,
      {
        filterFunc: options.filterFunc,
        entityName: options.entityName,
        eventName: options.eventName,
        entityDataProvider: options.entityDataProvider,
      },
    );

    return new FetchSortableDataListHandler<T, IdType>(this._idsDataProvider, {
      pageSize: options.pageSize,
      isMatchFunc: options.isMatchFunc || this.defaultIsMatchFunc,
      sortFunc: options.sortFunc || this.defaultSortFunc,
      transformFunc: options.transformFunc || this.defaultTransformFunc,
      entityName: options.entityName,
      eventName: options.eventName,
      hasMoreDown: options.defaultHasMoreDown,
      hasMoreUp: options.defaultHasMoreUp,
    });
  }

  fetchSortableDataHandler() {
    return this._foc;
  }

  protected defaultIsMatchFunc = (model: T) =>
    this._sourceIds.includes(model.id);

  protected defaultSortFunc = (
    lhs: ISortableModel<IdType>,
    rhs: ISortableModel<IdType>,
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
  };

  protected defaultTransformFunc = (model: T) => ({
    id: model.id,
    sortValue: this._sourceIds.indexOf(model.id),
  });

  dispose() {
    this._foc && this._foc.dispose();
  }
}

export { IdListPaginationHandler, IdListPaginationOptions };
