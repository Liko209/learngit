/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-23 23:32:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { IFetchSortableDataProvider } from './FetchSortableDataListHandler';
import { QUERY_DIRECTION } from 'sdk/dao';
import { hasValidEntity, getEntity } from '@/store/utils';
import { IdModel } from 'sdk/framework/model';
import { Entity } from '../../store';
import storeManager, { ENTITY_NAME } from '@/store';
import { JSdkError, ERROR_CODES_SDK } from 'sdk/error/sdk';
import { notificationCenter } from 'sdk/service';
import { ISortableModel } from './types';
interface IEntityDataProvider<T> {
  getByIds(ids: number[]): Promise<T[]>;
}

interface ISourceIdsChangeListener {
  onSourceIdsChanged(newIds: number[]): void;
}

class IdListDateProvider<T extends IdModel, K extends Entity>
  implements IFetchSortableDataProvider<T>, ISourceIdsChangeListener {
  private _cursors: { front: number | undefined; end: number | undefined };
  private _filterFunc: ((value: K, index?: number) => boolean) | undefined;
  private _sourceIds: number[];
  private _eventName: string;
  private _entityName: ENTITY_NAME;
  private _entityDataProvider: IEntityDataProvider<T>;
  constructor(
    sourceIds: number[],
    eventName: string,
    entityName: ENTITY_NAME,
    entityDataProvider: IEntityDataProvider<T>,
  ) {
    this._sourceIds = sourceIds;
    this._eventName = eventName;
    this._entityName = entityName;
    this._entityDataProvider = entityDataProvider;
  }

  setFilterFunc(
    filterFunc: ((value: K, index?: number) => boolean) | undefined,
  ) {
    this._filterFunc = filterFunc;
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

  private async _handleNewIds(newIds: number[]) {
    const entities = await this._entityDataProvider.getByIds(newIds);
    this._updateEntityStore(entities);
    notificationCenter.emitEntityUpdate(this._eventName, entities);
  }

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<T>,
  ): Promise<{ data: T[]; hasMore: boolean }> {
    const pageData = this._getIdsByPage(
      direction,
      pageSize,
      anchor && anchor.id,
    );
    await this._fetchAndSaveModels(pageData.ids);
    let validModels: K[] = [];
    pageData.ids.forEach((id: number) => {
      if (hasValidEntity(this._entityName, id)) {
        validModels.push(getEntity(this._entityName, id));
      }
    });

    if (this._filterFunc) {
      validModels = validModels.filter((model: K) => {
        return this._filterFunc && this._filterFunc(model);
      });
    }

    if (validModels.length < pageSize && pageData.hasMore) {
      return this.fetchData(
        direction,
        pageSize - validModels.length,
        this._toSortableModel(
          direction === QUERY_DIRECTION.NEWER
            ? this._cursors.end
            : this._cursors.front,
        ),
      );
    }

    return {
      data: this._toIdModels(pageData.ids),
      hasMore: true,
    };
  }

  private _toSortableModel(id: number | undefined) {
    return id ? { id, sortValue: id } : undefined;
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

    // if can not find the anchor id in source id.
    if (anchorId && this._sourceIds.indexOf(anchorId)) {
      return { hasMore, ids: slicedIds };
    }

    const pos = anchorId ? this._sourceIds.indexOf(anchorId) : -1;
    switch (direction) {
      case QUERY_DIRECTION.NEWER: {
        const posFromOne = pos + 1;
        slicedIds = _.slice(this._sourceIds, posFromOne, posFromOne + pageSize);
        this._cursors.end = _.last(slicedIds);
        hasMore = this._cursors.end !== _.last(this._sourceIds);
        break;
      }
      case QUERY_DIRECTION.OLDER: {
        slicedIds =
          pos === -1 ? this._sourceIds : _.slice(this._sourceIds, 0, pos);
        slicedIds = _.takeRight(slicedIds, pageSize);
        this._cursors.front = _.first(slicedIds);
        hasMore = this._cursors.front !== _.first(this._sourceIds);
        break;
      }
      default:
        throw new JSdkError(ERROR_CODES_SDK.GENERAL, 'not supported type');
    }

    return { hasMore, ids: slicedIds };
  }

  private async _fetchAndSaveModels(ids: number[]) {
    const needFetchIds: number[] = [];
    const modelsFromStore: K[] = [];
    ids.forEach((id: number) => {
      if (hasValidEntity(this._entityName, id)) {
        modelsFromStore.push(getEntity(this._entityName, id));
      } else {
        needFetchIds.push(id);
      }
    });

    await this._prepareModelsFromService(needFetchIds);
  }

  private async _prepareModelsFromService(ids: number[]) {
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

export { IdListDateProvider, IEntityDataProvider, ISourceIdsChangeListener };
