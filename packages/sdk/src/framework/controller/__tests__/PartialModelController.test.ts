/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-19 14:06:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PartialModifyController } from '../impl/PartialModifyController';
import { EntitySourceController } from '../impl/EntitySourceController';
import { Raw } from '../../../framework/model';
import { TestEntity, TestDatabase } from './TestTypes';
import { BaseDao } from '../../../framework/dao';
import { DeactivatedDao } from '../../../dao';
import notificationCenter from '../../../service/notificationCenter';
import { EntityPersistentController } from '../impl/EntityPersistentController';

describe('PartialModelController', () => {
  let partialModifyController: PartialModifyController<TestEntity>;

  let entitySourceController: EntitySourceController<TestEntity>;
  beforeEach(() => {
    const dao = new BaseDao<TestEntity>('TestEntity', new TestDatabase());
    const deactivatedDao = new DeactivatedDao(new TestDatabase());
    const entityPersistentController: EntityPersistentController<
      TestEntity
    > = new EntityPersistentController(dao);

    entitySourceController = new EntitySourceController<TestEntity>(
      entityPersistentController,
      deactivatedDao,
      undefined,
    );

    partialModifyController = new PartialModifyController(
      entitySourceController,
    );
  });

  describe('partialUpdate()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should trigger partial update event once, and update successfully', async () => {
      const updatedEntity = { id: 1, name: 'someone', note: 'a player' };
      jest
        .spyOn(entitySourceController, 'get')
        .mockResolvedValue({ id: 1, name: 'trump', note: 'a player' });

      jest
        .spyOn(entitySourceController, 'getEntityNotificationKey')
        .mockImplementationOnce(() => {
          return 'TestEntity';
        });

      const preHandlePartialFunc = (
        partialEntity: Partial<Raw<TestEntity>>,
        originalEntity: TestEntity,
      ) => {
        return { ...partialEntity, name: 'someone' };
      };

      const doUpdateFunc = async (updateEntity: TestEntity) => {
        return updateEntity;
      };

      jest
        .spyOn(entitySourceController, 'bulkUpdate')
        .mockImplementation(() => {});

      jest
        .spyOn(notificationCenter, 'emitEntityUpdate')
        .mockImplementationOnce(() => {});

      const result = await partialModifyController.updatePartially(
        1,
        preHandlePartialFunc,
        doUpdateFunc,
      );

      expect(result).toEqual(updatedEntity);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(1);
    });

    it('should not trigger partial update event once, when no changes', async () => {
      jest
        .spyOn(entitySourceController, 'get')
        .mockResolvedValue({ id: 1, name: 'someone', note: 'a player' });

      jest
        .spyOn(entitySourceController, 'getEntityNotificationKey')
        .mockImplementationOnce(() => {
          return 'TestEntity';
        });

      const preHandlePartialFunc = (
        partialEntity: Partial<Raw<TestEntity>>,
        originalEntity: TestEntity,
      ) => {
        return { ...partialEntity, name: 'someone' };
      };

      const doUpdateFunc = async (updateEntity: TestEntity) => {
        return updateEntity;
      };

      jest
        .spyOn(entitySourceController, 'bulkUpdate')
        .mockImplementation(() => {});

      const result = await partialModifyController.updatePartially(
        1,
        preHandlePartialFunc,
        doUpdateFunc,
      );
      expect(notificationCenter.emitEntityUpdate).not.toBeCalled();
      expect(result).toEqual({ id: 1, name: 'someone', note: 'a player' });
    });

    it('should trigger rollback, when exception', async () => {
      jest
        .spyOn(entitySourceController, 'get')
        .mockResolvedValue({ id: 1, name: 'someone', note: 'a player' });

      jest
        .spyOn(entitySourceController, 'getEntityNotificationKey')
        .mockImplementationOnce(() => {
          return 'TestEntity';
        });

      const preHandlePartialFunc = (
        partialEntity: Partial<Raw<TestEntity>>,
        originalEntity: TestEntity,
      ) => {
        return { ...partialEntity, name: 'trump' };
      };

      const doUpdateFunc = async (updateEntity: TestEntity) => {
        throw new Error();
      };

      jest
        .spyOn(entitySourceController, 'bulkUpdate')
        .mockImplementation(() => {});

      expect(
        partialModifyController.updatePartially(
          1,
          preHandlePartialFunc,
          doUpdateFunc,
        ),
      ).resolves.toThrow();
    });
  });

  describe('getRollbackPartialEntity()', () => {
    it('rollback partial model should be contain all partial keys', async () => {
      const partialEntity = {
        id: 3,
        name: 'someone',
        sex: 'boy',
      };

      const originalEntity = { id: 3, name: 'trump', note: 'a player' };

      const targetEntity = { id: 3, name: 'trump', sex: undefined };

      const rollbackEntity = await partialModifyController.getRollbackPartialEntity(
        partialEntity,
        originalEntity,
      );

      expect(rollbackEntity).toEqual(targetEntity);
    });
  });

  describe('getMergedEntity()', () => {
    it('merge difference to original model', async () => {
      const partialEntity = {
        id: 3,
        name: 'someone',
      };

      const originalEntity = { id: 3, name: 'trump', note: 'a player' };

      const targetEntity = { id: 3, name: 'someone', note: 'a player' };

      const mergedEntity = await partialModifyController.getMergedEntity(
        partialEntity,
        originalEntity,
      );

      expect(mergedEntity).toEqual(targetEntity);
    });
  });
});
