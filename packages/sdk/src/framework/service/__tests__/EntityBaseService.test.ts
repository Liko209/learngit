/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../EntityBaseService';
import { daoManager } from '../../../dao';
import { BaseDao, Query } from '../../../framework/dao';
import { TestDatabase, TestEntity } from '../../controller/__tests__/TestTypes';
import NetworkClient from '../../../api/NetworkClient';
import { JNetworkError, ERROR_CODES_NETWORK } from '../../../error';
import { EntityNotificationController } from '../../controller/impl/EntityNotificationController';
import { Person } from 'sdk/module/person/entity';
import { PersonDao } from 'sdk/module/person/dao';
import { PostDao } from 'sdk/module/post/dao';
import { Post } from 'sdk/module/post/entity';
import { ModelIdType } from 'sdk/framework/model';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';

jest.mock('../../../api/NetworkClient');
jest.mock('../../../dao');
jest.mock('../../../framework/dao');
jest.mock('sdk/framework/controller/impl/EntityCacheController');
jest.mock('sdk/framework/controller/impl/EntityPersistentController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('EntityBaseService', () => {
  const networkConfig = {
    basePath: '/basePath',
    networkClient: new NetworkClient(
      undefined as any,
      undefined as any,
      undefined as any,
    ),
  };
  let dao: BaseDao<TestEntity>;
  let deactivatedDao: BaseDao<TestEntity>;
  let service: EntityBaseService<TestEntity>;
  function setUp() {
    dao = new BaseDao('TestEntity', new TestDatabase());
    deactivatedDao = new BaseDao('DeactivatedDao', new TestDatabase());
    service = new EntityBaseService<TestEntity>(
      { isSupportedCache: true },
      dao,
      networkConfig,
    );
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('initialEntitiesCache()', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should call toArray api for PersonDao', () => {
      const dao = new PersonDao(new TestDatabase());
      const query: Query<Person, ModelIdType> = {
        toArray: jest.fn(),
        limit: jest.fn(),
      };

      jest.spyOn(dao, 'createQuery').mockReturnValue(query);
      query.limit.mockReturnValue(query);
      query.toArray.mockResolvedValue({ id: 1 });
      const service = new EntityBaseService<Person>(
        { isSupportedCache: true },
        dao,
        networkConfig,
      );
      service['initialEntitiesCache']();
      expect(query.toArray).toBeCalled();
    });

    it('should not call toArray api for other dao', () => {
      const dao = new PostDao(new TestDatabase());
      const query: Query<Post, ModelIdType> = {
        toArray: jest.fn(),
        limit: jest.fn(),
      };

      jest.spyOn(dao, 'createQuery').mockReturnValue(query);
      query.limit.mockReturnValue(query);
      query.toArray.mockResolvedValue({ id: 1 });
      const service = new EntityBaseService<Person>(
        { isSupportedCache: true },
        dao,
        networkConfig,
      );
      service['initialEntitiesCache']();
      expect(query.toArray).not.toBeCalled();
    });
  });

  describe('canSaveRemoteEntity()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('should return true', () => {
      const result = service['canSaveRemoteEntity']();
      expect(result).toBeTruthy();
    });

    it('should return true when init entity source controller', () => {
      service = new EntityBaseService<TestEntity>(
        { isSupportedCache: true },
        dao,
        networkConfig,
      );
      expect(service.getEntitySource()['canSaveRemoteData']).toBeTruthy();
    });
  });

  describe('getById()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      jest.spyOn(daoManager, 'getDao').mockImplementation(() => {
        return deactivatedDao;
      });
    });

    it('should call entity source controller once', async () => {
      const service = new EntityBaseService<TestEntity>(
        { isSupportedCache: true },
        dao,
        networkConfig,
      );
      const entitySourceController = service[
        '_entitySourceController'
      ] as EntitySourceController<TestEntity>;
      jest
        .spyOn(entitySourceController['entityPersistentController'], 'get')
        .mockImplementation(async () => {
          return { id: 1, name: 'hello' };
        });
      const result = await service.getById(1);

      expect(result).toEqual({ id: 1, name: 'hello' });
    });

    it('should call network client once', async () => {
      const service = new EntityBaseService<TestEntity>(
        { isSupportedCache: true },
        dao,
        networkConfig,
      );
      jest.spyOn(dao, 'get').mockImplementation(async () => {
        return null;
      });

      jest
        .spyOn(networkConfig.networkClient, 'get')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      expect(service.getById(1)).resolves.toEqual({ id: 1, name: 'jupiter' });
    });

    it('should call network client once and throw error', async () => {
      const service = new EntityBaseService<TestEntity>(
        { isSupportedCache: true },
        dao,
        networkConfig,
      );
      jest.spyOn(dao, 'get').mockImplementation(async () => {
        return null;
      });

      const error = new JNetworkError(
        ERROR_CODES_NETWORK.NOT_FOUND,
        'Not Found',
      );
      jest
        .spyOn(networkConfig.networkClient, 'get')
        .mockRejectedValueOnce(error);
      expect(service.getById(1)).rejects.toThrow();
    });

    it('should not call network client once when checkFunc return false', async () => {
      const service = new EntityBaseService<TestEntity>(
        { isSupportedCache: true },
        dao,
        networkConfig,
      );
      service._checkTypeFunc = jest.fn().mockReturnValue(false);
      jest.spyOn(dao, 'get').mockImplementation(async () => {
        return { id: 1, name: 'hello' };
      });
      const result = await service.getById(1);

      expect(result).toBeNull();
    });
  });

  describe('EntityNotificationController', () => {
    let controller: EntityNotificationController;
    beforeEach(() => {
      clearMocks();
      setUp();
      controller = new EntityNotificationController();
      service['_entityNotificationController'] = controller;
    });

    it('should call addObserver in controller when call addEntityNotificationObserver', () => {
      controller.addObserver = jest.fn();
      const observer = { id: 999 };
      service.addEntityNotificationObserver(observer as any);
      expect(controller.addObserver).toBeCalledWith(observer);
    });

    it('should call removeObserver in controller when call removeEntityNotificationObserver', () => {
      controller.removeObserver = jest.fn();
      const observer = { id: 999 };
      service.removeEntityNotificationObserver(observer as any);
      expect(controller.removeObserver).toBeCalledWith(observer);
    });

    it('should return EntityNotificationController when call getEntityNotificationController', () => {
      service['_entityNotificationController'] = undefined as any;
      const c1 = service.getEntityNotificationController();
      const c2 = service.getEntityNotificationController();
      expect(c1).toBeInstanceOf(EntityNotificationController);
      expect(c1 === c2).toBeTruthy();
    });
  });

  describe('onStopped', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should delete all controller', () => {
      const subscribeController = { id: 1, unsubscribe() {} } as any;
      const entitySourceController = { id: 2 } as any;
      const entityCacheController = { id: 3 } as any;
      const entityNotificationController = { id: 4 } as any;
      service['_subscribeController'] = subscribeController;
      service['_entitySourceController'] = entitySourceController;
      service['_entityCacheController'] = entityCacheController;
      service['_entityNotificationController'] = entityNotificationController;
      service.stop();
      expect(service['_subscribeController']).toBeUndefined();
      expect(service['_entitySourceController']).toBeUndefined();
      expect(service['_entityCacheController']).toBeUndefined();
      expect(service['_entityNotificationController']).toBeUndefined();
    });
  });
});
