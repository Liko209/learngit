/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-19 14:06:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PartialModifyController } from '../impl/PartialModifyController';
import { EntitySourceController } from '../impl/EntitySourceController';
import { Raw } from '../../model';
import { TestEntity, TestDatabase } from './TestTypes';
import { BaseDao } from '../../dao';
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

    partialModifyController = new PartialModifyController<TestEntity>(
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
        .spyOn(entitySourceController, 'update')
        .mockImplementation(async () => {});

      jest
        .spyOn(notificationCenter, 'emitEntityUpdate')
        .mockImplementationOnce(() => {});

      const result = await partialModifyController.updatePartially({
        entityId: 1,
        preHandlePartialEntity: preHandlePartialFunc,
        doUpdateEntity: doUpdateFunc,
      });

      expect(result).toEqual(updatedEntity);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
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
        .mockImplementation(async () => {});

      const result = await partialModifyController.updatePartially({
        entityId: 1,
        preHandlePartialEntity: preHandlePartialFunc,
        doUpdateEntity: doUpdateFunc,
      });
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalled();
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
        .mockImplementation(async () => {});

      expect(
        partialModifyController.updatePartially({
          entityId: 1,
          preHandlePartialEntity: preHandlePartialFunc,
          doUpdateEntity: doUpdateFunc,
        }),
      ).rejects.toThrow();
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

  describe('_handlePartialUpdateWithOriginal', () => {
    it('should not rollback when shouldRollback is false', async () => {
      partialModifyController.getRollbackPartialEntity = jest.fn();
      partialModifyController.getMergedEntity = jest.fn();
      const mockDoUpdateEntity = () => {
        throw 'test error';
      };
      partialModifyController['_doPartialSaveAndNotify'] = jest.fn();

      await partialModifyController['_handlePartialUpdateWithOriginal'](
        {} as any,
        {} as any,
        mockDoUpdateEntity,
        undefined,
        false,
        false,
        false,
      ).catch((err: string) => {
        expect(err).toEqual('test error');
      });
      expect(
        partialModifyController['_doPartialSaveAndNotify'],
      ).not.toHaveBeenCalled();
    });
  });
});
