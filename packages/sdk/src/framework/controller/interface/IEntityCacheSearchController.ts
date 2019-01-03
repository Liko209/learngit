/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 17:03:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';

type SortableModel<T> = {
  id: number;
  displayName: string;
  firstSortKey?: any;
  secondSortKey?: any;
  entity: T;
};

interface IEntityCacheSearchController<T extends IdModel = IdModel> {
  getEntityFromCache(id: number): T | null;

  getMultiEntitiesFromCache(
    ids: number[],
    filterFunc?: (entity: T) => boolean,
  ): Promise<T[]>;

  getEntitiesFromCache(filterFunc?: (entity: T) => boolean): Promise<T[]>;

  searchEntitiesFromCache(
    genSortableModelFunc: (
      entity: T,
      terms: string[],
    ) => SortableModel<T> | null,
    searchKey?: string,
    arrangeIds?: number[],
    sortFunc?: (entityA: SortableModel<T>, entityB: SortableModel<T>) => number,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<T>[];
  } | null>;

  isFuzzyMatched(srcText: string, terms: string[]): boolean;
}

export { IEntityCacheSearchController, SortableModel };
