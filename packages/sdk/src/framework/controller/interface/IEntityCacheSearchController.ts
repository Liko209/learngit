/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, SortableModel } from '../../model';
type Terms = {
  searchKeyTerms: string[];
  searchKeyTermsToSoundex: string[];
};
interface IEntityCacheSearchController<T extends IdModel = IdModel> {
  getEntity(id: number): Promise<T | null>;

  getMultiEntities(
    ids: number[],
    filterFunc?: (entity: T) => boolean,
  ): Promise<T[]>;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;

  searchEntities(
    genSortableModelFunc: (entity: T, terms: Terms) => SortableModel<T> | null,
    searchKey?: string,
    arrangeIds?: number[],
    sortFunc?: (entityA: SortableModel<T>, entityB: SortableModel<T>) => number,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<T>[];
  } | null>;

  isFuzzyMatched(srcText: string, terms: string[]): boolean;
  isSoundexMatched(
    soundexOfEntity: string[],
    soundexOfSearchTerms: string[],
  ): boolean;
  isStartWithMatched(srcText: string, terms: string[]): boolean;

  getTermsFromSearchKey(searchKey: string): string[];

  isInitialized(): boolean;
}

export { IEntityCacheSearchController, Terms };
