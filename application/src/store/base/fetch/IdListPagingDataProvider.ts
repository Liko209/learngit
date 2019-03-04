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
  private _options: IdListDataProviderOptions<T, K>;
  private _sourceIds: number[];

  constructor(sourceIds: number[], options: IdListDataProviderOptions<T, K>) {
    this._sourceIds = sourceIds;
    this._options = options;
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
    const validModels: K[] = [];
    pageData.ids.forEach((id: number) => {
      const model = getEntity(this._options.entityName, id) as K;
      this._options.filterFunc(model) && validModels.push(model);
    });

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
    const range = this._getCursorRange();
    const oldInRangeIds = this._getInCursorRangeIds(this._sourceIds, range);
    const newInRangeIds = this._getInCursorRangeIds(newSourceId, range);

    if (newInRangeIds === oldInRangeIds) {
      return;
    }

    this._handleIdSourceChanged(newInRangeIds, oldInRangeIds);
  }

  private async _handleIdSourceChanged(
    newInRangeIds: number[],
    oldInRangeIds: number[],
  ) {
    const changeMap: Map<number, IdModel> = new Map();
    const entities = await this._options.entityDataProvider.getByIds(
      newInRangeIds,
    );
    const entityMap: Map<number, T> = new Map();
    entities.forEach((entity: T) => {
      entityMap.set(entity.id, entity);
    });
    let pos = 0;
    while (newInRangeIds.length > pos) {
      changeMap.set(oldInRangeIds[pos], entityMap.get(newInRangeIds[pos]) as T);
      ++pos;
    }
    notificationCenter.emitEntityReplace(
      this._options.eventName,
      changeMap,
      true,
    );
  }

  private _getCursorRange() {
    const range = { front: -1, end: -1 };
    let pos = 0;
    for (const id of this._sourceIds) {
      range.front =
        range.front === -1 && id === this._cursors.front ? pos : range.front;

      range.end =
        range.end === -1 && id === this._cursors.end ? pos : range.end;
      pos++;

      if (range.front !== -1 && range.end !== -1) {
        break;
      }
    }
    return range;
  }

  private _getInCursorRangeIds(
    sourceIds: number[],
    range: { front: number; end: number },
  ) {
    return _.slice(sourceIds, range.front, range.end + 1);
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

  private _toSortableModel(id?: number) {
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
      return !hasValidEntity(this._options.entityName, id);
    });

    needFetchIds.length > 0 && (await this._fetchFromService(needFetchIds));
  }

  private async _fetchFromService(ids: number[]) {
    const entities = await this._options.entityDataProvider.getByIds(ids);
    this._updateEntityStore(entities);
  }

  private _updateEntityStore(models: T[]) {
    if (!models.length) {
      return;
    }
    if (this._options.entityName) {
      storeManager.dispatchUpdatedDataModels(this._options.entityName, models);
    }
  }
}

export { IdListPagingDataProvider };
