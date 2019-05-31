/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, SortableModel, ModelIdType } from '../../model';
type FormattedKey = {
  original: string;
  formatted: string;
};

type FormattedTerms = {
  formattedKeys: FormattedKey[];
  validFormattedKeys: FormattedKey[];
};

type Terms = {
  searchKeyTerms: string[];
  searchKeyTermsToSoundex: string[];
  searchKeyFormattedTerms: FormattedTerms;
};
interface IEntityCacheSearchController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> {
  getEntity(id: IdType): Promise<T | null>;

  getMultiEntities(
    ids: IdType[],
    filterFunc?: (entity: T) => boolean,
  ): Promise<T[]>;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;

  searchEntities(
    genSortableModelFunc: (entity: T, terms: Terms) => SortableModel<T> | null,
    genFormattedTermsFunc?: (originalTerms: string[]) => FormattedTerms,
    searchKey?: string,
    arrangeIds?: IdType[],
    sortFunc?: (entityA: SortableModel<T>, entityB: SortableModel<T>) => number,
  ): Promise<{
    terms: Terms;
    sortableModels: SortableModel<T>[];
  }>;

  isFuzzyMatched(srcText: string, terms: string[]): boolean;
  isSoundexMatched(
    soundexOfEntity: string[],
    soundexOfSearchTerms: string[],
  ): boolean;
  isStartWithMatched(srcText: string, terms: string[]): boolean;

  getTermsFromSearchKey(searchKey: string): string[];

  isInitialized(): boolean;
}

export { IEntityCacheSearchController, Terms, FormattedKey, FormattedTerms };
