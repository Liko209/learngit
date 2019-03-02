/// <reference path="../../__tests__/types.d.ts" />
import { daoManager } from '../../dao';
import BaseService from '../BaseService';
import { BaseDao, Query } from '../../framework/dao';
import { container } from '../../container';
import notificationCenter from '../notificationCenter';
import { SOCKET } from '../eventKey';
import dataDispatcher from '../../component/DataDispatcher/index';

import { SortableModel } from '../../models';
import { IdModel, Raw } from '../../framework/model';
import _ from 'lodash';
import {
  BaseResponse,
  JNetworkError,
  ERROR_CODES_NETWORK,
} from 'foundation/src';

jest.mock('../../framework/dao');

class MyDao extends BaseDao<{}> {}
const fakeApi = {
  getDataById: jest.fn(),
};
const EVENT = 'EVENT';

export type BaseServiceTestModel = IdModel & {
  name?: string;
  note?: string;
};

class AService extends BaseService<BaseServiceTestModel> {
  constructor(subscriptions?) {
    super(MyDao, fakeApi, jest.fn(), subscriptions);
  }

  preHandlePartialModel(
    partialModel: Partial<Raw<BaseServiceTestModel>>,
    originalModel: BaseServiceTestModel,
  ): Partial<Raw<BaseServiceTestModel>> {
    return partialModel;
  }

  async doPartialNotify(
    originalModels: BaseServiceTestModel[],
    updatedModels: BaseServiceTestModel[],
    partialModels: Partial<Raw<BaseServiceTestModel>>[],
  ) {
    notificationCenter.emitEntityUpdate(EVENT, updatedModels, partialModels);
  }

  async doUpdateModel(
    updatedModel: BaseServiceTestModel,
  ): Promise<BaseServiceTestModel | null> {
    return updatedModel;
  }

  sortEntitiesByName(
    groupA: SortableModel<BaseServiceTestModel>,
    groupB: SortableModel<BaseServiceTestModel>,
  ) {
    if (groupA.firstSortKey < groupB.firstSortKey) {
      return -1;
    }
    if (groupA.firstSortKey > groupB.firstSortKey) {
      return 1;
    }
    return 0;
  }
}

container.registerClass({
  name: AService.name,
  value: AService,
  singleton: true,
});

describe('BaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getInstance()', () => {
    it('should return same instance', () => {
      const instance = AService.getInstance();
      const instance2 = AService.getInstance();
      expect(instance).toBe(instance2);
    });
  });

  describe('getById()', () => {
    it('should return data from dao', async () => {
      const service = new AService();
      jest.spyOn(service, 'getByIdFromDao').mockResolvedValue({ id: 1 });
      jest.spyOn(service, 'getByIdFromAPI');

      const result = await service.getById(1);

      expect(result).toEqual({ id: 1 });
    });

    it('should return data from API when Dao not return value', async () => {
      const service = new AService();
      jest.spyOn(service, 'getByIdFromDao').mockResolvedValue(null);
      jest.spyOn(service, 'getByIdFromAPI').mockResolvedValue({ id: 2 });

      const result = await service.getById(2);

      expect(result).toEqual({ id: 2 });
    });
  });

  describe('getByIdFromLocal()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should return data from cache', async () => {
      const service = new AService();
      jest.spyOn(service, 'isCacheInitialized').mockReturnValueOnce(true);
      jest.spyOn(service, 'getEntityFromCache').mockResolvedValue({ id: 1 });
      const result = await service.getByIdFromLocal(1);
      expect(result).toEqual({ id: 1 });
    });

    it('should return data from dao when cache not return value', async () => {
      const service = new AService();
      jest.spyOn(service, 'isCacheInitialized').mockReturnValueOnce(true);
      jest.spyOn(service, 'getEntityFromCache').mockReturnValueOnce(undefined);
      jest.spyOn(service, 'getByIdFromDao').mockResolvedValue({ id: 2 });
      const result = await service.getByIdFromLocal(2);
      expect(result).toEqual({ id: 2 });
    });

    it('should return data from dao when cache is not initialized', async () => {
      const service = new AService();
      jest.spyOn(service, 'isCacheInitialized').mockReturnValueOnce(false);
      jest.spyOn(service, 'getByIdFromDao').mockResolvedValue({ id: 2 });
      const result = await service.getByIdFromLocal(2);
      expect(result).toEqual({ id: 2 });
    });
  });

  describe('getByIdFromDao()', () => {
    it('should return data from dao', async () => {
      const service = new AService();
      const dao = daoManager.get(MyDao);
      dao.get.mockResolvedValue({ id: 3 });

      const result = await service.getByIdFromDao(3);

      expect(result).toEqual({ id: 3 });
    });
  });

  describe('getByIdFromAPI()', () => {
    it('should return data from API', async () => {
      const service = new AService();
      fakeApi.getDataById.mockResolvedValue({ _id: 4 });

      const result = await service.getByIdFromAPI(4);

      expect(result).toEqual({ id: 4 });
      expect(service.getByIdFromAPI(-1)).resolves.toThrow();
    });
  });

  describe('getAllFromDao()', () => {
    it('should get all data from DAO', async () => {
      const service = new AService();

      const mockQuery = new Query(null, null);
      mockQuery.offset.mockReturnThis();
      mockQuery.limit.mockReturnThis();
      mockQuery.toArray.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const dao = daoManager.get(MyDao);
      dao.createQuery.mockReturnValue(mockQuery);

      const resp = await service.getAllFromDao();

      expect(resp).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('getAll()', () => {
    it('should get all data from DAO', async () => {
      const service = new AService();
      jest.spyOn(service, 'getAllFromDao').mockResolvedValue([{ id: 1 }]);

      const resp = await service.getAll();

      expect(resp).toEqual([{ id: 1 }]);
    });
  });

  describe('start()', () => {
    it('should subscribe events', () => {
      const mockFn = jest.fn();
      const service = new AService({ [EVENT]: mockFn });
      service.start();
      notificationCenter.emit(EVENT);
      expect(mockFn).toHaveBeenCalled();
    });
    it('should subscribe dataDispatcher', () => {
      const mockFn = jest.fn();
      dataDispatcher.register = jest.fn();
      const service = new AService({ [SOCKET.COMPANY]: mockFn });
      service.start();
      expect(dataDispatcher.register).toHaveBeenCalledWith(
        SOCKET.COMPANY,
        mockFn,
      );
    });
  });

  describe('stop()', () => {
    it('should unsubscribe events', () => {
      const mockFn = jest.fn();
      const service = new AService({ [EVENT]: mockFn });
      service.start();
      service.stop();
      notificationCenter.emit(EVENT);
      expect(mockFn).not.toHaveBeenCalled();
    });
    it('should unsubscribe dataDispatcher', () => {
      const mockFn = jest.fn();
      dataDispatcher.register = jest.fn();
      dataDispatcher.unregister = jest.fn();
      const service = new AService({ [SOCKET.COMPANY]: mockFn });
      service.start();
      service.stop();
      expect(dataDispatcher.unregister).toHaveBeenCalledWith(
        SOCKET.COMPANY,
        mockFn,
      );
    });
  });

  describe('getModelsLocally()', () => {
    it('should call deactivated dao, when include deactivate model', async () => {
      const service = new AService();
      const dao = daoManager.get(MyDao);
      dao.batchGet.mockResolvedValue([{ id: 3 }]);
      jest
        .spyOn(service, '_getDeactivatedModelsLocally')
        .mockResolvedValue([{ id: 4 }]);
      const result = await service.getModelsLocally([3, 4], true);
      expect(result.length).toBe(2);
    });

    it('should not call deactivated dao, when exclude deactivate model', async () => {
      const service = new AService();
      const dao = daoManager.get(MyDao);
      dao.batchGet.mockResolvedValue([{ id: 3 }]);
      jest
        .spyOn(service, '_getDeactivatedModelsLocally')
        .mockResolvedValue([{ id: 4 }]);
      const result = await service.getModelsLocally([3, 4], false);
      expect(result.length).toBe(1);
    });

    it('should not call deactivated dao, when all model activated', async () => {
      const service = new AService();
      const dao = daoManager.get(MyDao);
      dao.batchGet.mockResolvedValue([{ id: 3 }, { id: 4 }]);
      const result = await service.getModelsLocally([3, 4], false);
      expect(result.length).toBe(2);
    });
  });

  describe('partialUpdate()', () => {
    it('will trigger partial update event once', async () => {
      const service = new AService();

      const partialModel = {
        _id: 3,
        name: 'someone',
      };

      const updateModel = { id: 3, name: 'someone', note: 'a player' };
      jest.spyOn(service, 'doUpdateModel').mockResolvedValue(updateModel);

      jest
        .spyOn(service, 'getById')
        .mockResolvedValue({ id: 3, name: 'trump', note: 'a player' });

      service.doPartialNotify = jest.fn();

      const result = await service.handlePartialUpdate(
        partialModel,
        service.preHandlePartialModel,
        service.doUpdateModel,
        service.doPartialNotify,
      );

      expect(result).toEqual(updateModel);
      expect(service.doPartialNotify).toBeCalledTimes(1);
    });
  });

  describe('partialUpdate()', () => {
    it('should trigger partial update event twice', async () => {
      const service = new AService();

      const partialModel = {
        _id: 3,
        name: 'someone',
      };

      jest
        .spyOn(service, 'doUpdateModel')
        .mockRejectedValue(
          new JNetworkError(
            ERROR_CODES_NETWORK.NOT_NETWORK,
            'fake network error',
          ),
        );

      jest
        .spyOn(service, 'getById')
        .mockResolvedValue({ id: 3, name: 'trump', note: 'a player' });

      service.doPartialNotify = jest.fn();

      await expect(
        service.handlePartialUpdate(
          partialModel,
          service.preHandlePartialModel,
          service.doUpdateModel,
          service.doPartialNotify,
        ),
      ).rejects.toBeInstanceOf(JNetworkError);

      expect(service.doPartialNotify).toBeCalledTimes(2);
    });
  });

  describe('partialUpdate()', () => {
    it('will trigger partial update event zero', async () => {
      const service = new AService();

      const partialModel = {
        _id: 3,
        name: 'someone',
      };

      jest.spyOn(service, 'getById').mockResolvedValue(null);

      service.doPartialNotify = jest.fn();

      await expect(
        service.handlePartialUpdate(
          partialModel,
          service.preHandlePartialModel,
          service.doUpdateModel,
          service.doPartialNotify,
        ),
      ).rejects.not.toBeNull();

      expect(service.doPartialNotify).toBeCalledTimes(0);
    });
  });

  describe('partialUpdate()', () => {
    it('will not trigger partial update, due to no changes', async () => {
      const service = new AService();
      const partialModel = {
        _id: 3,
        name: 'trump',
      };

      const originalModel = { id: 3, name: 'trump', note: 'a player' };
      jest.spyOn(service, 'doUpdateModel').mockResolvedValue(originalModel);

      jest.spyOn(service, 'getById').mockResolvedValue(originalModel);

      service.doPartialNotify = jest.fn();

      const result = await service.handlePartialUpdate(
        partialModel,
        service.preHandlePartialModel,
        service.doUpdateModel,
        service.doPartialNotify,
      );
      expect(result).toEqual(originalModel);
      expect(service.doPartialNotify).toBeCalledTimes(0);
    });
  });

  describe('getRollbackPartialModel()', () => {
    it('rollback partial model should be contain all partial keys', async () => {
      const service = new AService();

      const partialModel = {
        id: 3,
        name: 'someone',
        sex: 'boy',
      };

      const originalModel = { id: 3, name: 'trump', note: 'a player' };

      const targetModel = { id: 3, name: 'trump', sex: undefined };

      service.doPartialNotify = jest.fn();

      const rollbackModel = await service.getRollbackPartialModel(
        partialModel,
        originalModel,
      );

      console.log('rollbackModel=', JSON.stringify(rollbackModel));
      expect(rollbackModel).toEqual(targetModel);
    });
  });

  describe('getMergedModel()', () => {
    it('merge difference to original model', async () => {
      const service = new AService();

      const partialModel = {
        id: 3,
        name: 'someone',
      };

      const originalModel = { id: 3, name: 'trump', note: 'a player' };

      const targetModel = { id: 3, name: 'someone', note: 'a player' };

      service.doPartialNotify = jest.fn();

      const mergedModel = await service.getMergedModel(
        partialModel,
        originalModel,
      );

      console.log('mergedModel=', JSON.stringify(mergedModel));

      const result = _.isEqual(mergedModel, targetModel);

      expect(result).toEqual(true);
    });
  });

  describe('Check Support Cache', () => {
    it('isSupportCache', async () => {
      const service = new AService();
      let result = service.isCacheEnable();
      expect(result).toEqual(false);

      service.enableCache();
      result = service.isCacheEnable();
      expect(result).toEqual(true);
      const cacheManager = service.getCacheManager();
      expect(cacheManager).toBeTruthy();
    });
  });

  describe('Check Cache Search', () => {
    it('get from cache', async () => {
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const entity1 = service.getEntityFromCache(entityA.id);
      expect(entity1).toBe(entityA);
      const entity2 = service.getEntityFromCache(entityB.id);
      expect(entity2).toBe(entityB);
      const entity3 = service.getEntityFromCache(entityC.id);
      expect(entity3).toBe(entityC);

      const entities = await service.getEntitiesFromCache(
        (entity: BaseServiceTestModel) => {
          return entity.id === entityB.id;
        },
      );
      expect(entities.length).toBe(1);
      expect(entities[0]).toBe(entityB);
    });

    it('searchEntitiesFromCache, no arrangeIds, has searchKey, has sort', async () => {
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const result = await service.searchEntitiesFromCache(
        async (entity: BaseServiceTestModel, terms: string[]) => {
          if (entity.name && service.isFuzzyMatched(entity.name, terms)) {
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
        service.sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityB);
      expect(result.sortableModels[1].entity).toBe(entityA);
    });

    it('searchEntitiesFromCache, has arrangeIds, has search key, has sort', async () => {
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const result = await service.searchEntitiesFromCache(
        async (entity: BaseServiceTestModel, terms: string[]) => {
          if (entity.name && service.isFuzzyMatched(entity.name, terms)) {
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
        service.sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(1);
      expect(result.sortableModels[0].entity).toBe(entityA);
    });

    it('searchEntitiesFromCache, has arrangeIds, no search key, has sort', async () => {
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const result = await service.searchEntitiesFromCache(
        async (entity: BaseServiceTestModel, terms: string[]) => {
          if (entity.name && service.isFuzzyMatched(entity.name, terms)) {
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
        service.sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(2);
      expect(result.sortableModels[0].entity).toBe(entityC);
      expect(result.sortableModels[1].entity).toBe(entityA);
    });

    it('searchEntitiesFromCache, has arrangeIds, no search key, no sort', async () => {
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const result = await service.searchEntitiesFromCache(
        async (entity: BaseServiceTestModel, terms: string[]) => {
          if (entity.name && service.isFuzzyMatched(entity.name, terms)) {
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
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const result = await service.searchEntitiesFromCache(
        async (entity: BaseServiceTestModel, terms: string[]) => {
          if (entity.name && service.isFuzzyMatched(entity.name, terms)) {
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
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const result = await service.searchEntitiesFromCache(
        async (entity: BaseServiceTestModel, terms: string[]) => {
          if (entity.name && service.isFuzzyMatched(entity.name, terms)) {
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
      const service = new AService();
      service.enableCache();

      const entityA = { id: 1, name: 'mr.dog', note: 'likes to eat bone' };
      const entityB = { id: 2, name: 'mr.cat', note: 'likes to eat fish' };
      const entityC = { id: 3, name: 'miss.snake', note: 'likes to eat blood' };
      const cacheManager = service.getCacheManager();
      cacheManager.set(entityA);
      cacheManager.set(entityB);
      cacheManager.set(entityC);

      const result = await service.searchEntitiesFromCache(
        async (entity: BaseServiceTestModel, terms: string[]) => {
          if (entity.name && service.isFuzzyMatched(entity.name, terms)) {
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
        service.sortEntitiesByName,
      );

      expect(result.sortableModels.length).toBe(3);
      expect(result.sortableModels[0].entity).toBe(entityC);
      expect(result.sortableModels[1].entity).toBe(entityB);
      expect(result.sortableModels[2].entity).toBe(entityA);
    });
  });

  describe('getMultiEntitiesFromCache()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should filter invalid model and return expected models', async () => {
      const service = new AService();
      service.enableCache();

      const models = [
        { id: 1, name: 'name', note: 'note' },
        { id: 2, name: 'name', note: 'note' },
        { id: 3, name: 'name', note: 'note' },
        { id: 4, name: 'name', note: 'note' },
        { id: 5, name: 'name', note: 'note' },
        { id: 6, name: 'name', note: 'note' },
      ];

      const cacheManager = service.getCacheManager();
      models.forEach(element => cacheManager.set(element));
      const res = await service.getMultiEntitiesFromCache(
        [1, 2, 3, 4, 5],
        (entity: BaseServiceTestModel) => {
          return entity.id > 3;
        },
      );
      expect(res).toEqual(models.splice(3, 2));
    });
  });
});
