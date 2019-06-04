/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 13:25:57
 * Copyright © RingCentral. All rights reserved.
 */
import { PostDao } from '../../../post/dao';
import { PreInsertController } from '../impl/PreInsertController';
import { ProgressService, PROGRESS_STATUS } from '../../../progress';
import notificationCenter from '../../../../service/notificationCenter';
import { UserConfigService } from '../../../../module/config/service/UserConfigService';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { Post } from 'sdk/module/post/entity';

jest.mock('../../../progress');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../dao');
jest.mock('../../../post/dao');
jest.mock('../../../../module/config/service/UserConfigService');
jest.mock('../../../../module/config/service/GlobalConfigService');

describe('PreInsertController', () => {
  let progressService: ProgressService;
  let preInsertController: PreInsertController;
  let dao: PostDao;

  function setup() {
    const userConfigService: UserConfigService = new UserConfigService();

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.GLOBAL_CONFIG_SERVICE) {
          return {
            get: jest.fn(),
          };
        }
        if (serviceName === ServiceConfig.USER_CONFIG_SERVICE) {
          return userConfigService;
        }
        return null;
      });
    userConfigService.setUserId.mockImplementation(() => {});
    progressService = new ProgressService();
    dao = new PostDao(null);
    preInsertController = new PreInsertController(dao, progressService);
    jest
      .spyOn(preInsertController, 'getEntityNotificationKey')
      .mockReturnValue('ENTITY.POST');
    return preInsertController;
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  }

  describe('insert()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call bulkPut and insert for unique_id', async () => {
      const post: Post = { id: -2, version: -2, unique_id: '-2' };
      const daoSpy = jest.spyOn(dao, 'bulkPut');
      const insertSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'insert',
      );
      await preInsertController.insert(post);
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(progressService.addProgress).toBeCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(1);
      expect(daoSpy).toBeCalledTimes(1);
      expect(insertSpy).toBeCalledTimes(1);
    });

    it('should call bulkPut and insert for version', async () => {
      const post: Post = { id: -2, version: -2 };
      const daoSpy = jest.spyOn(dao, 'bulkPut');
      const insertSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'insert',
      );
      await preInsertController.insert(post);
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(progressService.addProgress).toBeCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(1);
      expect(daoSpy).toBeCalledTimes(1);
      expect(insertSpy).toBeCalledTimes(1);
    });

    it('should not call bulkPut and insert if entity already in pre-insert for unique_id', async () => {
      const post: Post = { id: -2, version: -2, unique_id: '-2' };
      const daoSpy = jest.spyOn(dao, 'bulkPut');
      const insertSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'insert',
      );
      await preInsertController.insert(post);
      await preInsertController.insert(post);
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(progressService.addProgress).toBeCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(2);
      expect(daoSpy).toBeCalledTimes(1);
      expect(insertSpy).toBeCalledTimes(1);
    });

    it('should not call bulkPut and insert if entity already in pre-insert for version', async () => {
      const post: Post = { id: -2, version: -2 };
      const daoSpy = jest.spyOn(dao, 'bulkPut');
      const insertSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'insert',
      );
      await preInsertController.insert(post);
      await preInsertController.insert(post);
      expect(preInsertController.isInPreInsert('2')).toBe(false);
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(progressService.addProgress).toBeCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(2);
      expect(daoSpy).toBeCalledTimes(1);
      expect(insertSpy).toBeCalledTimes(1);
    });
  });

  describe('delete()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should delete entity if entity in pre-insert for version', async () => {
      const post: Post = { id: -2, version: -2 };
      await preInsertController.insert(post);
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      await preInsertController.delete(post);
      expect(preInsertController.isInPreInsert('-2')).toBe(false);
    });

    it('should delete entity if entity in pre-insert for unique_id', async () => {
      const post: Post = { id: -2, version: -2, unique_id: '-2' };
      await preInsertController.insert(post);
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      await preInsertController.delete(post);
      expect(preInsertController.isInPreInsert('-2')).toBe(false);
    });

    it('should do delete action if entity is not in pre-insert for version bug id < 0', async () => {
      const post: Post = { id: -2, version: 2 };
      const daoSpy = jest.spyOn(dao, 'delete');
      const deleteSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'delete',
      );
      await preInsertController.insert(post);
      await preInsertController.delete(post);
      await preInsertController.delete(post);
      expect(daoSpy).toBeCalledTimes(2);
      expect(deleteSpy).toBeCalledTimes(2);
    });

    it('should not do delete action if entity is not in pre-insert for unique_id but id < 0', async () => {
      const post: Post = { id: -2, version: 2, unique_id: '2' };
      const daoSpy = jest.spyOn(dao, 'delete');
      const deleteSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'delete',
      );
      await preInsertController.insert(post);
      await preInsertController.delete(post);
      await preInsertController.delete(post);
      expect(daoSpy).toBeCalledTimes(2);
      expect(deleteSpy).toBeCalledTimes(2);
    });

    it('should not do delete action if entity is not in pre-insert and id > 0', async () => {
      const post: Post = { id: 2, version: 2, unique_id: '2' };
      const daoSpy = jest.spyOn(dao, 'delete');
      const deleteSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'delete',
      );
      await preInsertController.insert(post);
      await preInsertController.delete(post);
      await preInsertController.delete(post);
      expect(daoSpy).toBeCalledTimes(1);
      expect(deleteSpy).toBeCalledTimes(1);
    });
  });

  describe('bulkDelete()', () => {
    const post1: Post = { id: -2, version: -2 };
    const post2: Post = { id: -3, version: -3 };
    const post3: Post = { id: -4, version: -4 };
    const post4: Post = { id: -2, version: -2, unique_id: '-2' };
    const post5: Post = { id: -3, version: -3, unique_id: '-3' };
    const post6: Post = { id: -4, version: -4, unique_id: '-4' };
    const post7: Post = { id: 2, version: -2, unique_id: '-5' };
    const post8: Post = { id: 3, version: -3, unique_id: '-6' };
    const post9: Post = { id: 4, version: -4, unique_id: '-7' };
    beforeEach(async () => {
      clearMocks();
      setup();
    });

    async function preInsert1() {
      await preInsertController.insert(post1);
      await preInsertController.insert(post2);
      await preInsertController.insert(post3);
    }

    async function preInsert2() {
      await preInsertController.insert(post4);
      await preInsertController.insert(post5);
      await preInsertController.insert(post6);
    }

    it('should delete all insert versions for version', async () => {
      await preInsert1();
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(preInsertController.isInPreInsert('-3')).toBe(true);
      expect(preInsertController.isInPreInsert('-4')).toBe(true);
      await preInsertController.bulkDelete([post1, post2, post3]);
      expect(preInsertController.isInPreInsert('-2')).toBe(false);
      expect(preInsertController.isInPreInsert('-3')).toBe(false);
      expect(preInsertController.isInPreInsert('-4')).toBe(false);
    });

    it('should delete all insert versions for unique_id', async () => {
      await preInsert2();
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(preInsertController.isInPreInsert('-3')).toBe(true);
      expect(preInsertController.isInPreInsert('-4')).toBe(true);
      await preInsertController.bulkDelete([post4, post5, post6]);
      expect(preInsertController.isInPreInsert('-2')).toBe(false);
      expect(preInsertController.isInPreInsert('-3')).toBe(false);
      expect(preInsertController.isInPreInsert('-4')).toBe(false);
    });

    it('should delete partial insert versions', async () => {
      await preInsert1();
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(preInsertController.isInPreInsert('-3')).toBe(true);
      expect(preInsertController.isInPreInsert('-4')).toBe(true);
      await preInsertController.bulkDelete([post1, post2]);
      expect(preInsertController.isInPreInsert('-2')).toBe(false);
      expect(preInsertController.isInPreInsert('-3')).toBe(false);
      expect(preInsertController.isInPreInsert('-4')).toBe(true);
    });

    it('should delete partial insert unique_id', async () => {
      await preInsert2();
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
      expect(preInsertController.isInPreInsert('-3')).toBe(true);
      expect(preInsertController.isInPreInsert('-4')).toBe(true);
      await preInsertController.bulkDelete([post4, post5]);
      expect(preInsertController.isInPreInsert('-2')).toBe(false);
      expect(preInsertController.isInPreInsert('-3')).toBe(false);
      expect(preInsertController.isInPreInsert('-4')).toBe(true);
    });

    it('should not delete entities from dao and do not emit notify if entities not in pre-insert list', async () => {
      await preInsert2();
      const daoSpy = jest.spyOn(dao, 'bulkDelete');
      const deleteSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'bulkDelete',
      );
      const notifyDeleteSpy = jest.spyOn(
        notificationCenter,
        'emitEntityDelete',
      );
      const notifyReplaceSpy = jest.spyOn(
        notificationCenter,
        'emitEntityReplace',
      );
      await preInsertController.bulkDelete([post7, post8, post9]);
      expect(daoSpy).toBeCalledTimes(0);
      expect(deleteSpy).toBeCalledTimes(0);
      expect(notifyDeleteSpy).toBeCalledTimes(0);
      expect(notifyReplaceSpy).toBeCalledTimes(0);
    });

    it('should not delete entities from dao and do not emit notify if entities is empty', async () => {
      await preInsert2();
      const daoSpy = jest.spyOn(dao, 'bulkDelete');
      const deleteSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'bulkDelete',
      );
      const notifyDeleteSpy = jest.spyOn(
        notificationCenter,
        'emitEntityDelete',
      );
      const notifyReplaceSpy = jest.spyOn(
        notificationCenter,
        'emitEntityReplace',
      );
      await preInsertController.bulkDelete([]);
      expect(deleteSpy).toBeCalledTimes(0);
      expect(notifyDeleteSpy).toBeCalledTimes(0);
      expect(notifyReplaceSpy).toBeCalledTimes(0);
      expect(daoSpy).toBeCalledTimes(0);
    });

    it('should delete entities from dao and emit notify if delete entities id < 0', async () => {
      await preInsert2();
      const daoSpy = jest.spyOn(dao, 'bulkDelete');
      const deleteSpy = jest.spyOn(
        preInsertController['_preInsertIdController'],
        'bulkDelete',
      );
      const notifyDeleteSpy = jest.spyOn(
        notificationCenter,
        'emitEntityDelete',
      );
      const notifyReplaceSpy = jest.spyOn(
        notificationCenter,
        'emitEntityReplace',
      );
      await preInsertController.bulkDelete([post4, post5, post6]);
      expect(deleteSpy).toBeCalledTimes(1);
      expect(notifyDeleteSpy).toBeCalledTimes(3);
      expect(notifyReplaceSpy).toBeCalledTimes(0);
      expect(daoSpy).toBeCalledTimes(1);
    });
  });

  describe('isInPreInsert()', () => {
    const post1: Post = { id: -2, version: -2 };
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return true for the insert version', async () => {
      await preInsertController.insert(post1);
      expect(preInsertController.isInPreInsert('-2')).toBe(true);
    });
  });

  describe('updateStatus()', () => {
    let progressService: ProgressService;

    beforeEach(async () => {
      //  preInsertController: PreInsertController;
      clearMocks();
      setup();
      progressService = new ProgressService();

      ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
      const dao = new PostDao(null);
      preInsertController = new PreInsertController(dao, progressService);
      jest
        .spyOn(preInsertController, 'getEntityNotificationKey')
        .mockReturnValue('ENTITY.POST');
      return preInsertController;
    });

    it('should call progressService.addProgress when preinsert', async () => {
      await preInsertController.updateStatus(
        { id: -2, version: -2 },
        PROGRESS_STATUS.INPROGRESS,
      );
      expect(progressService.addProgress).toHaveBeenCalledTimes(1);
    });

    it('should call progressService.deleteProgress when success', async () => {
      await preInsertController.updateStatus(
        { id: -2, version: -2 },
        PROGRESS_STATUS.SUCCESS,
      );
      expect(progressService.deleteProgress).toHaveBeenCalledTimes(1);
    });

    it('should call updateProgress when failed', async () => {
      await preInsertController.updateStatus(
        { id: -2, version: -2 },
        PROGRESS_STATUS.FAIL,
      );
      expect(progressService.updateProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEntityNotificationKey()', () => {
    beforeEach(() => {
      clearMocks();
    });
    it('should return entity name when has dao', () => {
      const preInsertController = setup();
      const result = preInsertController.getEntityNotificationKey();
      expect(result).toEqual('ENTITY.POST');
    });
  });
});
