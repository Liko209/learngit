/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  buildEntityCacheController,
  buildEntityCacheSearchController,
} from '../';
import { IdModel } from '../../model';
import { IEntityCacheController } from '../interface/IEntityCacheController';
import {
  IEntityCacheSearchController,
  SortableModel,
  Terms,
} from '../interface/IEntityCacheSearchController';
import { SearchUtils } from '../../utils/SearchUtils';
const soundex = require('soundex-code');
export type TestModel = IdModel & {
  name?: string;
  note?: string;
};

describe('Entity Cache Search Controller', () => {
  let entityCacheController: IEntityCacheController;
  let entityCacheSearchController: IEntityCacheSearchController;

  function sortEntitiesByName(
    groupA: SortableModel<TestModel>,
    groupB: SortableModel<TestModel>,
  ): number {
    if (groupA.firstSortKey < groupB.firstSortKey) {
      return -1;
    }
    if (groupA.firstSortKey > groupB.firstSortKey) {
      return 1;
    }
    return 0;
  }

  beforeAll(() => {
    entityCacheController = buildEntityCacheController();
    entityCacheSearchController = buildEntityCacheSearchController(
      entityCacheController,
    );
  });

  describe('Check Cache Search', () => {
    beforeEach(() => {
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(false);
    });
    it('get from cache', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };

      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const entity1 = await entityCacheSearchController.getEntity(entityA.id);
      expect(entity1).toBe(entityA);
      const entity2 = await entityCacheSearchController.getEntity(entityB.id);
      expect(entity2).toBe(entityB);
      const entity3 = await entityCacheSearchController.getEntity(entityC.id);
      expect(entity3).toBe(entityC);

      const entities = await entityCacheSearchController.getEntities(
        (entity: TestModel) => {
          return entity.id === entityB.id;
        },
      );
      expect(entities.length).toBe(1);
      expect(entities[0]).toBe(entityB);
    });

    it('searchEntitiesFromCache, no arrangeIds, has searchKey, has sort', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };

      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        'Mr',
        undefined,
        sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityB);
      expect(result.sortableModels[1].entity).toBe(entityA);
    });

    it('searchEntitiesFromCache, has arrangeIds, has search key, has sort', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        'Mr',
        [entityA.id, entityC.id],
        sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(1);
      expect(result.sortableModels[0].entity).toBe(entityA);
    });

    it('searchEntitiesFromCache, has arrangeIds, no search key, has sort', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        undefined,
        [entityA.id, entityC.id],
        sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityC);
      expect(result.sortableModels[1].entity).toBe(entityA);
    });

    it('searchEntitiesFromCache, has arrangeIds, no search key, no sort', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        undefined,
        [entityA.id, entityC.id],
        undefined,
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityA);
      expect(result.sortableModels[1].entity).toBe(entityC);
    });

    it('searchEntitiesFromCache, no arrangeIds, no search key, no sort', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        undefined,
        undefined,
        undefined,
      );

      expect(result.sortableModels.length).toBe(3);
      expect(result.sortableModels[0].entity).toBe(entityA);
      expect(result.sortableModels[1].entity).toBe(entityB);
      expect(result.sortableModels[2].entity).toBe(entityC);
    });

    it('searchEntitiesFromCache, no arrangeIds, has search key, no sort', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        'Mr',
        undefined,
        undefined,
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityA);
      expect(result.sortableModels[1].entity).toBe(entityB);
    });

    it('searchEntitiesFromCache, no arrangeIds, no search key, has sort', async () => {
      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        undefined,
        undefined,
        sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(3);
      expect(result.sortableModels[0].entity).toBe(entityC);
      expect(result.sortableModels[1].entity).toBe(entityB);
      expect(result.sortableModels[2].entity).toBe(entityA);
    });

    it('should match entityA when the parameter of searchEntities has special charactor search key, ', async () => {
      const entityA = {
        id: 1,
        name: 'abc([.?*+^$[]\\(){}|-])',
        note: 'likes to eat bone',
      };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);

      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              entity.name || '',
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        '([.?*+ ^$[] \\(){} |-])',
        undefined,
        undefined,
      );

      expect(result.sortableModels.length).toBe(1);
      expect(result.sortableModels[0].entity).toBe(entityA);
    });
  });

  describe('getMultiEntitiesFromCache()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should filter invalid model and return expected models', async () => {
      const models = [
        { id: 1, name: 'name', note: 'note' },
        { id: 2, name: 'name', note: 'note' },
        { id: 3, name: 'name', note: 'note' },
        { id: 4, name: 'name', note: 'note' },
        { id: 5, name: 'name', note: 'note' },
        { id: 6, name: 'name', note: 'note' },
      ];

      models.forEach(async (element: TestModel) => {
        await entityCacheController.put(element);
      });
      const res = await entityCacheSearchController.getMultiEntities(
        [1, 2, 3, 4, 5],
        (entity: TestModel) => {
          return entity.id > 3;
        },
      );
      expect(res).toEqual(models.splice(3, 2));
    });
  });

  describe('Check Cache Search when use soundex', () => {
    beforeEach(() => {
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(true);
    });
    it('should return two results with soundex when no arrangeIds, has search key, no sort', async () => {
      const entityA = { id: 1, name: 'mr.Knuth', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.Kant', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);
      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              [soundex(entity.name)],
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        'Mr.knt',
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityA);
      expect(result.sortableModels[1].entity).toBe(entityB);
    });
    it('should return two results with soundex when no arrangeIds, has search key, no sort', async () => {
      const entityA = { id: 1, name: 'mr.Knuth', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.Kant', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      await entityCacheController.put(entityA);
      await entityCacheController.put(entityB);
      await entityCacheController.put(entityC);
      const result = await entityCacheSearchController.searchEntities(
        (entity: TestModel, terms: Terms) => {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          const isMatched =
            entityCacheSearchController.isFuzzyMatched(
              entity.name.toLowerCase() || '',
              searchKeyTerms,
            ) ||
            entityCacheSearchController.isSoundexMatched(
              [soundex(entity.name)],
              searchKeyTermsToSoundex,
            );
          if (entity.name && isMatched) {
            return {
              entity,
              id: entity.id,
              displayName: entity.name,
              firstSortKey: entity.name.toLowerCase(),
            };
          }
          return null;
        },
        'Mr.k',
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityA);
      expect(result.sortableModels[1].entity).toBe(entityB);
    });
  });
});
