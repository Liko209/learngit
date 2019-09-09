/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-10 10:10:12
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../../../dao';
import { TestEntity, TestDatabase } from './TestTypes';
import { EntityPersistentController } from '../impl/EntityPersistentController';
import { IEntityCacheController } from '../interface/IEntityCacheController';
import { buildEntityCacheController } from '..';

jest.mock('../interface/IEntityCacheController');

describe('EntityPersistentController', () => {
  let dao: BaseDao<TestEntity>;
  let entityCacheController: IEntityCacheController<TestEntity>;
  let entityPersistentController: EntityPersistentController<TestEntity>;
  beforeEach(() => {
    dao = new BaseDao('TestEntity', new TestDatabase());
    entityCacheController = buildEntityCacheController();
    entityPersistentController = new EntityPersistentController(
      dao,
      entityCacheController,
    );
  });
  describe('getEntities', () => {
    it('should filter again when the first filter get empty from entity', async () => {
      const entities = [{ id: 1, type: 1 }, { id: 3, type: 3 }];
      entityCacheController.bulkPut(entities);
      dao.getAll = jest.fn().mockResolvedValueOnce(entities);

      const result = await entityPersistentController.getEntities(
        (model: any) => model.type === 2,
      );
      expect(result.length).toEqual(0);
    });

    it('should return data when entity cache controller has data', async () => {
      const entities = [{ id: 1, type: 1 }, { id: 3, type: 3 }];
      entityCacheController.bulkPut(entities);
      dao.getAll = jest.fn().mockResolvedValueOnce(entities);

      const result = await entityPersistentController.getEntities(
        (model: any) => model.type === 1,
      );
      expect(result[0]).toEqual({ id: 1, type: 1 });
    });

    it('should return all data from dao when has no entity cache controller and no filter func ', async () => {
      const entities = [{ id: 1, type: 1 }, { id: 3, type: 3 }];
      dao.getAll = jest.fn().mockResolvedValueOnce(entities);
      delete entityPersistentController['entityCacheController'];
      const result = await entityPersistentController.getEntities();
      expect(result).toEqual(entities);
    });

    it('should return filtered and sorted data from dao when has no entity cache controller   ', async () => {
      const entities = [
        { id: 1, type: 1 },
        { id: 2, type: 2 },
        { id: 3, type: 3 },
      ];
      dao.getAll = jest.fn().mockResolvedValueOnce(entities);
      delete entityPersistentController['entityCacheController'];
      const result = await entityPersistentController.getEntities(
        (model: any) => model.type !== 3,
        (a, b) => b.id - a.id,
      );
      expect(result).toEqual([entities[1], entities[0]]);
    });
  });
});
