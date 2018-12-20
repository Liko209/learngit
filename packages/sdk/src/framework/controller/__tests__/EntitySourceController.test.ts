/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-19 10:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntitySourceController } from '../impl/EntitySourceController';
import { RequestController } from '../impl/RequestController';
import { BaseDao, DeactivatedDao } from '../../../dao';
import { TestEntity, TestDatabase } from './TestTypes';

describe('RequestController', () => {
  let dao: BaseDao<TestEntity>;
  let deactivatedDao: DeactivatedDao;
  let requestController: RequestController<TestEntity>;
  let controller: EntitySourceController<TestEntity>;
  beforeEach(() => {
    dao = new BaseDao('TestEntity', new TestDatabase());
    deactivatedDao = new DeactivatedDao(new TestDatabase());
    requestController = new RequestController<TestEntity>(undefined);
    controller = new EntitySourceController<TestEntity>(
      dao,
      deactivatedDao,
      requestController,
    );
  });

  describe('getEntity()', () => {
    it('should not call requestController.getDataById when local has', async () => {
      jest
        .spyOn(controller, 'getEntityLocally')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });

      jest.spyOn(requestController, 'getDataById').mockImplementation(() => {});

      const result = await controller.getEntity(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(requestController.getDataById).not.toHaveBeenCalled();
    });

    it('should call requestController.getDataById when local has not, remote has', async () => {
      jest.spyOn(controller, 'getEntityLocally').mockResolvedValueOnce(null);
      jest
        .spyOn(requestController, 'getDataById')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      const result = await controller.getEntity(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(requestController.getDataById).toHaveBeenCalled();
    });

    it('should throw exception when local has not, entity id is invalid', async () => {
      jest.spyOn(controller, 'getEntityLocally').mockResolvedValueOnce(null);
      expect(controller.getEntity(-1)).resolves.toThrow();
    });
  });

  describe('getEntityLocally()', () => {
    it('should return entity when db has', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      jest.spyOn(deactivatedDao, 'get').mockImplementation(() => {});

      const result = await controller.getEntityLocally(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(deactivatedDao.get).not.toHaveBeenCalled();
    });

    it('should return entity when deactivated db has', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce(null);
      jest.spyOn(deactivatedDao, 'get').mockImplementation(() => {
        return { id: 1, name: 'jupiter' };
      });

      const result = await controller.getEntityLocally(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
      expect(deactivatedDao.get).toHaveBeenCalled();
    });

    it('should return entity when deactivated db has not', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce(null);
      jest.spyOn(deactivatedDao, 'get').mockImplementation(() => {
        return null;
      });
      const result = await controller.getEntityLocally(1);
      expect(result).toBeNull();
      expect(deactivatedDao.get).toHaveBeenCalled();
    });
  });

  describe('bulkUpdate()', () => {
    it('should return entity when db has', async () => {
      jest.spyOn(dao, 'bulkUpdate').mockImplementation(() => {});

      await controller.bulkUpdate([
        { id: 1, name: 'jupiter1' },
        { id: 2, name: 'jupiter2' },
      ]);
      expect(dao.bulkUpdate).toHaveBeenCalled();
    });
  });

  describe('getEntitiesLocally()', () => {
    it('should return entities when in db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [{ id: 1, name: 'jupiter1' }, { id: 2, name: 'jupiter2' }];
      });

      const result = await controller.getEntitiesLocally([1, 2], true);
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('jupiter1');
      expect(result[1].id).toBe(2);
      expect(result[1].name).toBe('jupiter2');
    });

    it('should return entities when part in db, part in deactivated db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [{ id: 1, name: 'jupiter1' }];
      });

      jest.spyOn(deactivatedDao, 'batchGet').mockImplementation(() => {
        return [{ id: 2, name: 'jupiter2' }];
      });

      const result = await controller.getEntitiesLocally([1, 2], true);
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(deactivatedDao.batchGet).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('jupiter1');
      expect(result[1].id).toBe(2);
      expect(result[1].name).toBe('jupiter2');
    });

    it('should return entities all in deactivated db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [];
      });

      jest.spyOn(deactivatedDao, 'batchGet').mockImplementation(() => {
        return [{ id: 1, name: 'jupiter1' }, { id: 2, name: 'jupiter2' }];
      });

      const result = await controller.getEntitiesLocally([1, 2], true);
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(deactivatedDao.batchGet).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('jupiter1');
      expect(result[1].id).toBe(2);
      expect(result[1].name).toBe('jupiter2');
    });

    it('should return empty all not in db', async () => {
      jest.spyOn(dao, 'batchGet').mockImplementation(() => {
        return [];
      });

      jest.spyOn(deactivatedDao, 'batchGet').mockImplementation(() => {
        return [];
      });

      const result = await controller.getEntitiesLocally([1, 2], true);
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

      const result = await controller.getEntitiesLocally([1, 2], false);
      expect(dao.batchGet).toHaveBeenCalledTimes(1);
      expect(deactivatedDao.batchGet).not.toHaveBeenCalledTimes(1);
      expect(result.length).toBe(0);
    });
  });

  describe('getEntityKey()', () => {
    it('should return entity when db has', () => {
      const result = controller.getEntityNotificationKey();
      expect(result).toBe('ENTITY.TESTENTITY');
    });
  });
});
