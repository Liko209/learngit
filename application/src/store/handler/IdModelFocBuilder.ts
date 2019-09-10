/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-21 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModelWithData,
} from '@/store/base';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ENTITY_NAME } from '@/store';
import { IdModel } from 'sdk/framework/model';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { PerformanceTracer } from 'foundation/performance';

const FOC_PERFORMANCE_TAG = 'FOC_PERFORMANCE';
class IdModelDataProvider implements IFetchSortableDataProvider<IdModel> {
  constructor(
    private _entitySource: IEntitySourceController<IdModel>,
    private _transformFunc: (model: IdModel) => ISortableModelWithData<IdModel>,
    private _filterFunc: (model: IdModel) => boolean,
    private _sortFunc: (
      lhs: ISortableModelWithData<IdModel>,
      rhs: ISortableModelWithData<IdModel>,
    ) => number,
  ) {}
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModelWithData<IdModel>,
  ): Promise<{ data: IdModel[]; hasMore: boolean }> {
    const performanceTracer = PerformanceTracer.start();
    const dataArray = await this._entitySource.getEntities(
      (model: IdModel) => {
        return this._filterFunc(model);
      },
      (modelA: IdModel, modelB: IdModel) => {
        return this._sortFunc(
          this._transformFunc(modelA),
          this._transformFunc(modelB),
        );
      },
    );

    const result = ArrayUtils.sliceIdModelArray(
      dataArray,
      pageSize,
      anchor ? { id: anchor.id } : anchor,
      direction,
    );

    performanceTracer.end({
      key: `${FOC_PERFORMANCE_TAG}_${this._entitySource.getEntityName()}`,
      count: result && result.data ? result.data.length : 0,
    });

    return result;
  }
}

class IdModelFocBuilder {
  static buildFoc(
    entitySource: IEntitySourceController<IdModel>,
    transformFunc: (model: IdModel) => ISortableModelWithData<IdModel>,
    filterFunc: (model: IdModel) => boolean,
    sortFunc: (
      lhs: ISortableModelWithData<IdModel>,
      rhs: ISortableModelWithData<IdModel>,
    ) => number,
  ) {
    const options = {
      isMatchFunc: filterFunc,
      transformFunc,
      sortFunc,
      entityName: ENTITY_NAME[entitySource.getEntityName()],
      eventName: entitySource.getEntityNotificationKey(),
      hasMoreDown: true,
    };

    return new FetchSortableDataListHandler(
      new IdModelDataProvider(
        entitySource,
        transformFunc,
        filterFunc,
        sortFunc,
      ),
      options,
    );
  }
}

export { IdModelFocBuilder };
