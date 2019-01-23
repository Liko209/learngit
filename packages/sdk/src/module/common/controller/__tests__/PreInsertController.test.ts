/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 13:25:57
 * Copyright © RingCentral. All rights reserved.
 */
import { PostDao, ConfigDao, daoManager } from '../../../../dao';
import { PreInsertController } from '../impl/PreInsertController';
import { ProgressService, PROGRESS_STATUS } from '../../../progress';
import notificationCenter from '../../../../service/notificationCenter';

jest.mock('../../../progress');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../dao');

describe.skip('PreInsertController', () => {
  let preInsertController: PreInsertController;
  const progressService: ProgressService = new ProgressService();
  const dao = new PostDao(null);
  const configDao = new ConfigDao(null);

  beforeEach(() => {
    jest.spyOn(daoManager, 'getKVDao').mockReturnValueOnce(configDao);
    preInsertController = new PreInsertController(dao, progressService);
    ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('insert', () => {
    beforeEach(() => {
      jest
        .spyOn(preInsertController, 'getEntityNotificationKey')
        .mockReturnValueOnce('ENTITY.POST');
    });
    it('should call add progress and emit update', async () => {
      await preInsertController.insert({ id: -2, version: -2 });
      expect(progressService.addProgress).toBeCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(1);
    });
  });

  describe('incomesStatusChange', () => {
    beforeEach(() => {
      jest
        .spyOn(preInsertController, 'getEntityNotificationKey')
        .mockReturnValueOnce('ENTITY.POST');
    });
    it('should call dao delete when success', async () => {
      await preInsertController.delete({ id: -2, version: -2 });
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

  describe('getEntityNotificationKey', () => {
    beforeEach(() => {
      jest
        .spyOn(preInsertController, 'getEntityNotificationKey')
        .mockReturnValueOnce('ENTITY.POST');
    });
    it('should return entity name when has dao', () => {
      const result = preInsertController.getEntityNotificationKey();
      expect(result).toEqual('ENTITY.POST');
    });
  });
});
