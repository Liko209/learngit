/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-23 23:32:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { IFetchSortableDataProvider } from './FetchSortableDataListHandler';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { hasValidEntity, getEntity } from '@/store/utils';
import { IdModel } from 'sdk/framework/model';
import { Entity } from '../../store';
import { JSdkError, ERROR_CODES_SDK } from 'sdk/error/sdk';
import notificationCenter from 'sdk/service/notificationCenter';
import { ISortableModel, IMatchFunc, IEntityDataProvider } from './types';
import storeManager from '@/store/base/StoreManager';
import { ENTITY_NAME } from '@/store/constants';

type IdListDataProviderOptions<T, K> = {
  eventName: string;
  entityName: ENTITY_NAME;
  entityDataProvider: IEntityDataProvider<T>;
  filterFunc: IMatchFunc<K>;
};

class IdListPagingDataProvider<T extends IdModel, K extends Entity>
  implements IFetchSortableDataProvider<T> {
  private _cursors: { front: number | undefined; end: number | undefined } = {
    front: undefined,
    end: undefined,
  };
  private _filterFunc: IMatchFunc<K>;
  private _sourceIds: number[];
  private _eventName: string;
  private _entityName: ENTITY_NAME;
  private _entityDataProvider: IEntityDataProvider<T>;

  constructor(sourceIds: number[], options: IdListDataProviderOptions<T, K>) {
    this._sourceIds = sourceIds;
    this._eventName = options.eventName;
    this._entityName = options.entityName;
    this._entityDataProvider = options.entityDataProvider;
    this._filterFunc = options.filterFunc;
  }

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<T>,
  ): Promise<{ data: T[]; hasMore: boolean }> {
    if (!this._sourceIds.length) {
      return { data: [], hasMore: false };
    }

    const realAnchorId = anchor
      ? this._getRightAnchor(direction, anchor.id)
      : undefined;
    const pageData = this._getIdsByPage(direction, pageSize, realAnchorId);

    await this._fetchAndSaveModels(pageData.ids);
    let validModels: K[] = pageData.ids.map((id: number) => {
      return getEntity(this._entityName, id);
    });

    if (this._filterFunc) {
      validModels = validModels.filter((model: K) => {
        return this._filterFunc && this._filterFunc(model);
      });
    }
    let hasMore = pageData.hasMore;
    let idModels = this._toIdModels(validModels.map(x => x.id));
    if (idModels.length < pageSize && hasMore) {
      const nextPageData = await this.fetchData(
        direction,
        pageSize - validModels.length,
        this._toSortableModel(
          direction === QUERY_DIRECTION.NEWER
            ? this._cursors.end
            : this._cursors.front,
        ),
      );
      idModels =
        direction === QUERY_DIRECTION.NEWER
          ? idModels.concat(nextPageData.data)
          : nextPageData.data.concat(idModels);
      hasMore = nextPageData.hasMore;
    }

    return {
      hasMore,
      data: idModels,
    };
  }

  onSourceIdsChanged(newSourceId: number[]) {
    const newIds = _.difference(newSourceId, this._sourceIds);
    if (newIds.length > 0) {
      this._handleNewIds(newIds);
    }

    const deletedIds = _.difference(this._sourceIds, newSourceId);
    if (deletedIds.length > 0) {
      notificationCenter.emitEntityDelete(this._eventName, deletedIds);
    }
  }

  private _getRightAnchor(direction: QUERY_DIRECTION, anchorId: number) {
    const anchorPos = this._sourceIds.indexOf(anchorId);
    switch (direction) {
      case QUERY_DIRECTION.NEWER: {
        const cursorPos = this._cursors.end
          ? this._sourceIds.indexOf(this._cursors.end)
          : -1;

        return cursorPos > anchorPos ? this._cursors.end : anchorId;
      }
      case QUERY_DIRECTION.OLDER: {
        const cursorPos = this._cursors.front
          ? this._sourceIds.indexOf(this._cursors.front)
          : -1;

        return cursorPos !== -1 && cursorPos < anchorPos
          ? this._cursors.front
          : anchorId;
      }
      default:
        throw new JSdkError(
          ERROR_CODES_SDK.GENERAL,
          'not supported direction, _getRightAnchor',
        );
    }
  }

  private async _handleNewIds(newIds: number[]) {
    const entities = await this._entityDataProvider.getByIds(newIds);
    this._updateEntityStore(entities);
    notificationCenter.emitEntityUpdate(this._eventName, entities);
  }

  private _toSortableModel(id: number | undefined) {
    return id && id !== -1 ? { id, sortValue: id } : undefined;
  }

  private _toIdModels(ids: number[]) {
    return ids.map((id: number) => {
      return { id } as T;
    });
  }

  private _getIdsByPage(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchorId?: number,
  ): { ids: number[]; hasMore: boolean } {
    let hasMore = true;
    let slicedIds: number[] = [];

    const pos = anchorId ? this._sourceIds.indexOf(anchorId) : -1;
    switch (direction) {
      case QUERY_DIRECTION.NEWER: {
        const starPos = pos + 1;
        slicedIds = _.slice(this._sourceIds, starPos, starPos + pageSize);
        this._cursors.end = _.last(slicedIds) || this._cursors.end;
        hasMore = this._cursors.end !== _.last(this._sourceIds);

        // update front cursor if need
        if (!this._cursors.front) {
          this._cursors.front = anchorId
            ? anchorId
            : (_.first(this._sourceIds) as number);
        }

        break;
      }
      case QUERY_DIRECTION.OLDER: {
        slicedIds = pos === -1 ? [] : _.slice(this._sourceIds, 0, pos);
        slicedIds = _.takeRight(slicedIds, pageSize);
        const firstId = _.first(slicedIds);
        if (firstId) {
          hasMore = firstId !== _.first(this._sourceIds);
          this._cursors.front = firstId;
        } else {
          hasMore = false;
        }

        // update end cursor if need
        if (!this._cursors.end) {
          this._cursors.end = anchorId
            ? anchorId
            : (_.last(this._sourceIds) as number);
        }
        break;
      }
      default:
        throw new JSdkError(ERROR_CODES_SDK.GENERAL, 'not supported type');
    }

    return { hasMore, ids: slicedIds };
  }

  private async _fetchAndSaveModels(ids: number[]) {
    const needFetchIds: number[] = ids.filter((id: number) => {
      return !hasValidEntity(this._entityName, id);
    });

    needFetchIds.length > 0 && (await this._fetchFromService(needFetchIds));
  }

  private async _fetchFromService(ids: number[]) {
    const entities = await this._entityDataProvider.getByIds(ids);
    this._updateEntityStore(entities);
  }

  private _updateEntityStore(models: T[]) {
    if (!models.length) {
      return;
    }
    if (this._entityName) {
      storeManager.dispatchUpdatedDataModels(this._entityName, models);
    }
  }
}

export { IdListPagingDataProvider };
