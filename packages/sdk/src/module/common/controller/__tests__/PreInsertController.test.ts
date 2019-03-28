/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 13:25:57
 * Copyright © RingCentral. All rights reserved.
 */
import { PostDao } from '../../../post/dao';
import { PreInsertController } from '../impl/PreInsertController';
import { ProgressService, PROGRESS_STATUS } from '../../../progress';
import notificationCenter from '../../../../service/notificationCenter';
// import { GlobalConfigService } from '../../../../module/config';
import { UserConfigService } from '../../../../module/config/service/UserConfigService';
import { GlobalConfigService } from '../../../../module/config/service/GlobalConfigService';

jest.mock('../../../progress');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../dao');
jest.mock('../../../post/dao');
jest.mock('../../../../module/config/service/UserConfigService');
jest.mock('../../../../module/config/service/GlobalConfigService');

// GlobalConfigService.getInstance = jest.fn();

describe('PreInsertController', () => {
  // afterEach(() => {
  //   jest.restoreAllMocks();
  //   jest.resetAllMocks();
  //   jest.clearAllMocks();
  // });
  let progressService: ProgressService;
  function setup() {
    let preInsertController: PreInsertController;

    progressService = new ProgressService();

    ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
    const dao = new PostDao(null);
    preInsertController = new PreInsertController(dao, progressService);
    jest
      .spyOn(preInsertController, 'getEntityNotificationKey')
      .mockReturnValue('ENTITY.POST');
    return preInsertController;
  }

  describe('insert()', () => {
    it('should call addProgress & notificationCenter.emitEntityUpdate', async () => {
      GlobalConfigService.getInstance = jest.fn().mockReturnValue({
        get: jest.fn(),
      });
      const userConfigService: UserConfigService = new UserConfigService();
      UserConfigService.getInstance = jest
        .fn()
        .mockReturnValue(userConfigService);
      userConfigService.setUserId.mockImplementation(() => {});
      const preInsertController = setup();
      await preInsertController.insert({ id: -2, version: -2 });
      expect(preInsertController.isInPreInsert(-2)).toBe(true);
      expect(progressService.addProgress).toBeCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(1);
    });
  });

  describe('delete()', () => {
    it('should call add progress and emit update', async () => {
      const preInsertController = setup();
      await preInsertController.insert({ id: -2, version: -2 });
      expect(preInsertController.isInPreInsert(-2)).toBe(true);
      await preInsertController.delete({ id: -2, version: -2 });
      expect(preInsertController.isInPreInsert(-2)).toBe(false);
    });
  });

  describe('bulkDelete()', () => {
    let preInsertController;
    beforeEach(async () => {
      preInsertController = setup();
      await preInsertController.insert({ id: -2, version: -2 });
      await preInsertController.insert({ id: -3, version: -3 });
      await preInsertController.insert({ id: -4, version: -4 });
    });

    it('should delete all insert versions', async () => {
      expect(preInsertController.isInPreInsert(-2)).toBe(true);
      expect(preInsertController.isInPreInsert(-3)).toBe(true);
      expect(preInsertController.isInPreInsert(-4)).toBe(true);
      await preInsertController.bulkDelete([
        { id: -2, version: -2 },
        { id: -3, version: -3 },
        { id: -4, version: -4 },
      ]);
      expect(preInsertController.isInPreInsert(-2)).toBe(false);
      expect(preInsertController.isInPreInsert(-3)).toBe(false);
      expect(preInsertController.isInPreInsert(-4)).toBe(false);
    });

    it('should delete partial insert versions', async () => {
      expect(preInsertController.isInPreInsert(-2)).toBe(true);
      expect(preInsertController.isInPreInsert(-3)).toBe(true);
      expect(preInsertController.isInPreInsert(-4)).toBe(true);
      await preInsertController.bulkDelete([
        { id: -2, version: -2 },
        { id: -3, version: -3 },
        { id: -5, version: -5 },
      ]);
      expect(preInsertController.isInPreInsert(-2)).toBe(false);
      expect(preInsertController.isInPreInsert(-3)).toBe(false);
      expect(preInsertController.isInPreInsert(-4)).toBe(true);
    });
  });

  describe('isInPreInsert()', () => {
    it('should return true for the insert version', async () => {
      const preInsertController = setup();
      await preInsertController.insert({ id: -2, version: -2 });
      expect(preInsertController.isInPreInsert(-2)).toBe(true);
    });
  });

  describe('updateStatus()', () => {
    let preInsertController;
    let progressService: ProgressService;

    beforeEach(async () => {
      //  preInsertController: PreInsertController;

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
    it('should return entity name when has dao', () => {
      const preInsertController = setup();
      const result = preInsertController.getEntityNotificationKey();
      expect(result).toEqual('ENTITY.POST');
    });
  });
});
