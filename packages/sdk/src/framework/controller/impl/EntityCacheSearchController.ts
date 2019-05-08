/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, SortableModel, ModelIdType } from '../../../framework/model';
import {
  IEntityCacheSearchController,
  Terms,
} from '../interface/IEntityCacheSearchController';

import { IEntityCacheController } from '../interface/IEntityCacheController';
import { SearchUtils } from '../../utils/SearchUtils';
const soundex = require('soundex-code');

class EntityCacheSearchController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> implements IEntityCacheSearchController<T, IdType> {
  constructor(
    public entityCacheController: IEntityCacheController<T, IdType>,
  ) {}

  async getEntity(id: IdType): Promise<T | null> {
    return await this.entityCacheController.get(id);
  }

  async getMultiEntities(
    ids: IdType[],
    filterFunc?: (entity: T) => boolean,
  ): Promise<T[]> {
    const entities = await this.entityCacheController.batchGet(ids);

    if (filterFunc) {
      const filteredResult: T[] = [];
      entities.forEach((entity: T) => {
        if (filterFunc(entity)) {
          filteredResult.push(entity);
        }
      });
      return filteredResult;
    }
    return entities;
  }

  async getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]> {
    return await this.entityCacheController.getEntities(filterFunc);
  }

  async searchEntities(
    genSortableModelFunc: (entity: T, terms: Terms) => SortableModel<T> | null,
    searchKey?: string,
    arrangeIds?: IdType[],
    sortFunc?: (entityA: SortableModel<T>, entityB: SortableModel<T>) => number,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<T>[];
  } | null> {
    const searchTerms: Terms = {
      searchKeyTerms: [],
      searchKeyTermsToSoundex: [],
    };
    let entities: T[];
    const sortableEntities: SortableModel<T>[] = [];
    const isUseSoundex = await SearchUtils.isUseSoundex();
    if (searchKey) {
      searchTerms.searchKeyTerms = this.getTermsFromSearchKey(
        searchKey.toLowerCase().trim(),
      );
      if (isUseSoundex) {
        searchTerms.searchKeyTermsToSoundex = searchTerms.searchKeyTerms.map(
          item => soundex(item),
        );
      }
    }

    if (arrangeIds) {
      entities = await this.entityCacheController.batchGet(arrangeIds, true);
    } else {
      entities = await this.getEntities();
    }

    entities.forEach((entity: T) => {
      const result = genSortableModelFunc(entity, searchTerms);
      if (result) {
        sortableEntities.push(result);
      }
    });

    if (sortFunc && sortableEntities.length) {
      sortableEntities.sort(sortFunc);
    }

    return {
      terms: searchTerms.searchKeyTerms,
      sortableModels: sortableEntities,
    };
  }

  isFuzzyMatched(srcText: string, terms: string[]): boolean {
    return SearchUtils.isFuzzyMatched(srcText, terms);
  }
  isSoundexMatched(
    soundexOfEntity: string[],
    soundexOfSearchTerms: string[],
  ): boolean {
    return SearchUtils.isSoundexMatched(soundexOfEntity, soundexOfSearchTerms);
  }
  isStartWithMatched(srcText: string, terms: string[]): boolean {
    return SearchUtils.isStartWithMatched(srcText, terms);
  }

  getTermsFromSearchKey(searchKey: string) {
    return searchKey.split(/[\s,]+/);
  }

  isInitialized(): boolean {
    return this.entityCacheController.isInitialized();
  }
}

export { EntityCacheSearchController };
