/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-23 23:32:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { IFetchSortableDataProvider } from './FetchSortableDataListHandler';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { hasValidEntity, getEntity } from '@/store/utils';
import { IdModel, ModelIdType } from 'sdk/framework/model';
import { Entity } from '../../store';
import { JSdkError, ERROR_CODES_SDK } from 'sdk/error/sdk';
import notificationCenter from 'sdk/service/notificationCenter';
import { ISortableModel, IMatchFunc, IEntityDataProvider } from './types';
import storeManager from '@/store/base/StoreManager';
import { ENTITY_NAME } from '@/store/constants';

type IdListDataProviderOptions<
  T extends IdModel<IdType>,
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
> = {
  eventName: string;
  entityName: ENTITY_NAME;
  entityDataProvider: IEntityDataProvider<T, IdType>;
  filterFunc: IMatchFunc<K>;
};

const DEFAULT_PAGE_SIZE = 20;

class IdListPagingDataProvider<
  T extends IdModel<IdType>,
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
> implements IFetchSortableDataProvider<T, IdType, ISortableModel<IdType>> {
  private _cursors: { front: IdType | undefined; end: IdType | undefined } = {
    front: undefined,
    end: undefined,
  };
  private _options: IdListDataProviderOptions<T, K, IdType>;
  private _sourceIds: IdType[];

  constructor(
    sourceIds: IdType[],
    options: IdListDataProviderOptions<T, K, IdType>,
  ) {
    this._sourceIds = sourceIds;
    this._options = options;
  }

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<IdType>,
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
    pageData.ids.forEach((id: IdType) => {
      if (hasValidEntity(this._options.entityName, id)) {
        const model = getEntity(this._options.entityName, id) as K;
        this._options.filterFunc(model) && validModels.push(model);
      }
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
        ) as ISortableModel<IdType>,
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

  onSourceIdsChanged(newSourceIds: IdType[]) {
    const oldSourceIds = _.cloneDeep(this._sourceIds);
    const newIds = new Set(_.difference(newSourceIds, oldSourceIds));
    const deletedIds = new Set(_.difference(oldSourceIds, newSourceIds));
    const newIdsWithoutNew = newSourceIds.filter(
      (value: IdType) => !newIds.has(value),
    );
    const oldIdsWithoutOld = oldSourceIds.filter(
      (value: IdType) => !deletedIds.has(value),
    );

    if (!_.isEqual(newIdsWithoutNew, oldIdsWithoutOld)) {
      const range = this._getCursorRange();
      const oldInRangeIds = this._getInCursorRangeIds(oldSourceIds, range);
      const idPosMap: Map<IdType, number> = new Map();
      newSourceIds.forEach((value: IdType, index: number) => {
        idPosMap.set(value, index);
      });

      let endPos = 0;
      let frontPos = 0;
      oldInRangeIds.forEach((id: IdType) => {
        const pos = idPosMap.get(id);
        if (pos) {
          frontPos = pos < frontPos ? pos : frontPos;
          endPos = pos > endPos ? pos : endPos;
        }
      });

      const rangeLength = range.end - range.front;
      if (endPos - frontPos < rangeLength) {
        endPos = frontPos + rangeLength;
      }

      const mightChangedIds = this._getInCursorRangeIds(newSourceIds, {
        front: frontPos,
        end: endPos,
      });

      mightChangedIds.length > 0 && this._notifyUpdates(mightChangedIds);
    } else {
      newIds.size > 0 && this._notifyUpdates(Array.from(newIds));
    }

    deletedIds.size > 0 && this._notifyDeletes(Array.from(deletedIds));

    this._sourceIds = newSourceIds;
  }

  private _notifyDeletes(deletedIds: IdType[]) {
    deletedIds.length > 0 &&
      notificationCenter.emitEntityDelete(this._options.eventName, deletedIds);
  }

  private async _notifyUpdates(updatedIds: IdType[]) {
    const updateEntities = await this._options.entityDataProvider.getByIds(
      updatedIds,
    );
    notificationCenter.emitEntityUpdate<T, IdType>(
      this._options.eventName,
      updateEntities,
    );
  }

  private _getCursorRange() {
    const range = { front: -1, end: -1 };

    if (this._cursors.front === undefined || this._cursors.end === undefined) {
      range.front = 0;
      range.end = DEFAULT_PAGE_SIZE;
    } else {
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
    }

    return range;
  }

  private _getInCursorRangeIds(
    sourceIds: IdType[],
    range: { front: number; end: number },
  ) {
    return _.slice(sourceIds, range.front, range.end + 1);
  }

  private _getRightAnchor(direction: QUERY_DIRECTION, anchorId: IdType) {
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

  private _toSortableModel(id?: IdType) {
    return id ? { id, sortValue: id } : undefined;
  }

  private _toIdModels(ids: IdType[]) {
    return ids.map((id: IdType) => ({ id } as T));
  }

  private _getIdsByPage(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchorId?: IdType,
  ): { ids: IdType[]; hasMore: boolean } {
    let hasMore = true;
    let slicedIds: IdType[] = [];

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
            : (_.first(this._sourceIds) as IdType);
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
            : (_.last(this._sourceIds) as IdType);
        }
        break;
      }
      default:
        throw new JSdkError(ERROR_CODES_SDK.GENERAL, 'not supported type');
    }

    return { hasMore, ids: slicedIds };
  }

  private async _fetchAndSaveModels(ids: IdType[]) {
    const needFetchIds: IdType[] = ids.filter((id: IdType) => !hasValidEntity(this._options.entityName, id));

    needFetchIds.length > 0 && (await this._fetchFromService(needFetchIds));
  }

  private async _fetchFromService(ids: IdType[]) {
    const entities = await this._options.entityDataProvider.getByIds(ids);
    this._updateEntityStore(entities);
  }

  private _updateEntityStore(models: T[]) {
    if (!models || !models.length) {
      return;
    }
    if (this._options.entityName) {
      storeManager.dispatchUpdatedDataModels(this._options.entityName, models);
    }
  }
}

export { IdListPagingDataProvider };
