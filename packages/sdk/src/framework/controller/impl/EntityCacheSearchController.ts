/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../../framework/model';
import {
  IEntityCacheSearchController,
  SortableModel,
} from '../interface/IEntityCacheSearchController';

import { IEntityCacheController } from '../interface/IEntityCacheController';

class EntityCacheSearchController<T extends IdModel = IdModel>
  implements IEntityCacheSearchController<T> {
  constructor(public entityCacheController: IEntityCacheController<T>) {}

  async getEntity(id: number): Promise<T | null> {
    return await this.entityCacheController.get(id);
  }

  async getMultiEntities(
    ids: number[],
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
  } | null> {
    let terms: string[] = [];
    let entities: T[];
    const sortableEntities: SortableModel<T>[] = [];

    if (searchKey) {
      terms = this.getTermsFromSearchKey(searchKey.trim());
    }

    if (arrangeIds) {
      entities = await this.entityCacheController.batchGet(arrangeIds, true);
    } else {
      entities = await this.getEntities();
    }

    entities.forEach((entity: T) => {
      const result = genSortableModelFunc(entity, terms);
      if (result) {
        sortableEntities.push(result);
      }
    });

    if (sortFunc && sortableEntities.length) {
      sortableEntities.sort(sortFunc);
    }

    return { terms, sortableModels: sortableEntities };
  }

  isFuzzyMatched(srcText: string, terms: string[]): boolean {
    return srcText.length > 0
      ? terms.reduce(
          (prev: boolean, key: string) =>
            prev && new RegExp(`${key}`, 'i').test(srcText),
          true,
        )
      : false;
  }

  isStartWithMatched(srcText: string, terms: string[]): boolean {
    if (srcText.length > 0) {
      for (let i = 0; i < terms.length; ++i) {
        if (new RegExp(`^${terms[i]}`, 'i').test(srcText)) {
          return true;
        }
      }
    }
    return false;
  }

  getTermsFromSearchKey(searchKey: string) {
    return searchKey.split(/[\s,]+/);
  }

  isInitialized(): boolean {
    return this.entityCacheController.isInitialized();
  }
}

export { EntityCacheSearchController };
