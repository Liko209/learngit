/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-19 10:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntitySourceController } from '../impl/EntitySourceController';
import { RequestController } from '../impl/RequestController';
import { BaseDao, DeactivatedDao } from '../../../dao';
import { TestEntity, TestDatabase } from './TestTypes';
import { EntityPersistentController } from '../impl/EntityPersistentController';

describe('EntitySourceController', () => {
  let dao: BaseDao<TestEntity>;
  let deactivatedDao: DeactivatedDao;
  let requestController: RequestController<TestEntity>;
  let entitySourceController: EntitySourceController<
    TestEntity,
    number | string
  >;
  let entityPersistentController: EntityPersistentController<TestEntity>;

  function setup() {
    dao = new BaseDao('TestEntity', new TestDatabase());
    deactivatedDao = new DeactivatedDao(new TestDatabase());
    requestController = new RequestController<TestEntity>(undefined);
    entityPersistentController = new EntityPersistentController(dao);
    entitySourceController = new EntitySourceController<TestEntity>(
      entityPersistentController,
      deactivatedDao,
      requestController,
    );
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  describe('get()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should save entity if it is fetched from remote when enable save', async () => {
      entitySourceController = new EntitySourceController<TestEntity>(
        entityPersistentController,
        deactivatedDao,
        requestController,
        true,
      );
      jest
        .spyOn(entitySourceController, 'getEntityLocally')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(requestController, 'get')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      dao.put = jest.fn();
      const daoPutSpyOn = jest.spyOn(dao, 'put');
      await entitySourceController.get(1);
      expect(daoPutSpyOn).toBeCalledWith({ id: 1, name: 'jupiter' });
    });
    it('should not save entity if it is fetched from remote when disable save', async () => {
      entitySourceController = new EntitySourceController<TestEntity>(
        entityPersistentController,
        deactivatedDao,
        requestController,
        false,
      );
      jest
        .spyOn(entitySourceController, 'getEntityLocally')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(requestController, 'get')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      dao.put = jest.fn();
      const daoPutSpyOn = jest.spyOn(dao, 'put');
      await entitySourceController.get(1);
      expect(daoPutSpyOn).not.toBeCalled();
    });
  });

  describe('getEntity()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should not call requestController.getDataById when local has', async () => {
      jest
        .spyOn(entitySourceController, 'getEntityLocally')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });

      jest
        .spyOn(requestController, 'get')
        .mockImplementation((id: number) => {});

      const result = await entitySourceController.get(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(requestController.get).not.toHaveBeenCalled();
    });

    it('should call requestController.getDataById when local has not, remote has', async () => {
      jest
        .spyOn(entitySourceController, 'getEntityLocally')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(requestController, 'get')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      const result = await entitySourceController.get(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(requestController.get).toHaveBeenCalled();
    });

    it('should return null when local has not, entity id is invalid', async () => {
      jest
        .spyOn(entitySourceController, 'getEntityLocally')
        .mockResolvedValueOnce(null);
      const result = await entitySourceController.get(-1);
      expect(result).toEqual(null);
    });

    it('should call requestController.get when local has not, and entity id is string', async () => {
      jest
        .spyOn(entitySourceController, 'getEntityLocally')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(requestController, 'get')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      const result = await entitySourceController.get('-1');
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(requestController.get).toHaveBeenCalled();
    });
  });

  describe('getEntityLocally()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return entity when db has', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      jest.spyOn(deactivatedDao, 'get').mockImplementation(() => {});

      const result = await entitySourceController.getEntityLocally(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(deactivatedDao.get).not.toHaveBeenCalled();
    });

    it('should return entity when deactivated db has', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce(null);
      jest.spyOn(deactivatedDao, 'get').mockImplementation(() => {
        return { id: 1, name: 'jupiter' };
      });

      const result = await entitySourceController.getEntityLocally(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(deactivatedDao.get).toHaveBeenCalled();
    });

    it('should return null when deactivated db has not', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce(null);
      jest.spyOn(deactivatedDao, 'get').mockImplementation(() => {
        return null;
      });
      const result = await entitySourceController.getEntityLocally(1);
      expect(result).toBeNull();
      expect(deactivatedDao.get).toHaveBeenCalled();
    });
  });

  describe('bulkUpdate()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return entity when db has', async () => {
      jest.spyOn(dao, 'bulkUpdate').mockImplementation(() => {});

      await entitySourceController.bulkUpdate([
        { id: 1, name: 'jupiter1' },
        { id: 2, name: 'jupiter2' },
      ]);
      expect(dao.bulkUpdate).toHaveBeenCalled();
    });
  });

  describe('getEntitiesLocally()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return entities when in db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [{ id: 1, name: 'jupiter1' }, { id: 2, name: 'jupiter2' }];
      });

      const result = await entitySourceController.getEntitiesLocally(
        [1, 2],
        true,
      );
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ id: 1, name: 'jupiter1' });
      expect(result[1]).toEqual({ id: 2, name: 'jupiter2' });
    });

    it('should return entities when part in db, part in deactivated db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [{ id: 1, name: 'jupiter1' }];
      });

      jest.spyOn(deactivatedDao, 'batchGet').mockImplementation(() => {
        return [{ id: 2, name: 'jupiter2' }];
      });

      const result = await entitySourceController.getEntitiesLocally(
        [1, 2],
        true,
      );
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(deactivatedDao.batchGet).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ id: 1, name: 'jupiter1' });
      expect(result[1]).toEqual({ id: 2, name: 'jupiter2' });
    });

    it('should return entities all in deactivated db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [];
      });

      jest.spyOn(deactivatedDao, 'batchGet').mockImplementation(() => {
        return [{ id: 1, name: 'jupiter1' }, { id: 2, name: 'jupiter2' }];
      });

      const result = await entitySourceController.getEntitiesLocally(
        [1, 2],
        true,
      );
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(deactivatedDao.batchGet).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ id: 1, name: 'jupiter1' });
      expect(result[1]).toEqual({ id: 2, name: 'jupiter2' });
    });

    it('should return empty all not in db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [];
      });

      jest.spyOn(deactivatedDao, 'batchGet').mockImplementation(() => {
        return [];
      });

      const result = await entitySourceController.getEntitiesLocally(
        [1, 2],
        true,
      );
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(deactivatedDao.batchGet).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(0);
    });

    it('should return empty all not in deactivated db, when deactivated false ', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [];
      });

      jest.spyOn(deactivatedDao, 'batchGet').mockImplementation(() => {
        return [{ id: 1, name: 'jupiter1' }, { id: 2, name: 'jupiter2' }];
      });

      const result = await entitySourceController.getEntitiesLocally(
        [1, 2],
        false,
      );
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(deactivatedDao.batchGet).not.toHaveBeenCalledTimes(1);
      expect(result.length).toBe(0);
    });
  });

  describe('getEntityKey()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return entity when db has', () => {
      const result = entitySourceController.getEntityNotificationKey();
      expect(result).toBe('ENTITY.TESTENTITY');
    });
  });

  describe('batchGet', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should not throw error when get from server and error happens', async () => {
      const ids = [1];
      deactivatedDao.batchGet = jest.fn().mockResolvedValue([]);
      entityPersistentController.batchGet = jest.fn().mockResolvedValue([]);
      requestController.get = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      expect(entitySourceController.batchGet(ids)).resolves.toEqual([]);
    });

    it('should filter null and undefined and duplicated when do batchGet', async () => {
      const ids = [1, 2, null, 3, undefined, 1, 5];
      deactivatedDao.batchGet = jest.fn().mockResolvedValue([]);
      const spy = jest.spyOn(entityPersistentController, 'batchGet');
      spy.mockResolvedValueOnce([]);
      requestController.get = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      await entitySourceController.batchGet(ids, true);
      expect(spy).toBeCalledWith([1, 2, 3, 5], true);
    });

    it('should return [] if has not valid ids', async () => {
      const ids = [null, undefined];
      deactivatedDao.batchGet = jest.fn().mockResolvedValue([]);
      const spy = jest.spyOn(entityPersistentController, 'batchGet');
      spy.mockResolvedValueOnce([]);
      requestController.get = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      const result = await entitySourceController.batchGet(ids, true);
      expect(result).toEqual([]);
      expect(spy).not.toBeCalled();
    });
  });
});
