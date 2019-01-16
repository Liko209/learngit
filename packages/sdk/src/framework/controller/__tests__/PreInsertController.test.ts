/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 13:25:57
 * Copyright © RingCentral. All rights reserved.
 */
import { PostDao } from '../../../dao';
import { PreInsertController } from '../impl/PreInsertController';
import { ProgressService } from '../../../module/progress';
import { DexieDB } from 'foundation';
import notificationCenter from '../../../service/notificationCenter';
jest.mock('../../../module/progress');
jest.mock('../../../service/notificationCenter');

const schema = {
  name: 'Glip',
  version: 1,
  schema: {
    1: {
      post: {
        unique: 'id',
      },
    },
  },
};
describe('PreInsertController', () => {
  let preInsertController: PreInsertController;
  const progressService: ProgressService = new ProgressService();

  beforeEach(() => {
    const dao = new PostDao(new DexieDB(schema));
    preInsertController = new PreInsertController(dao);
    ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('preInsert', () => {
    it('', async () => {
      await preInsertController.preInsert({ id: -2 });
      expect(progressService.addProgress).toBeCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toBeCalledTimes(1);
    });
    it('', () => {});
  });
  describe('incomesStatusChange', () => {
    it('should call dao delete when success', async () => {
      await preInsertController.incomesStatusChange(-1, true);
      expect(progressService.deleteProgress).toHaveBeenCalledTimes(1);
    });
    it('should call updateProgress when failed', async () => {
      await preInsertController.incomesStatusChange(-1, false);
      expect(progressService.updateProgress).toHaveBeenCalledTimes(1);
    });
  });
  describe('getEntityNotificationKey', () => {
    it('should return entity name when has dao', () => {
      const result = preInsertController.getEntityNotificationKey();
      expect(result).toEqual('ENTITY.POST');
    });
    it('should throw error when has not dao instance', () => {
      preInsertController = new PreInsertController(null);
      try {
        preInsertController.getEntityNotificationKey();
        expect(true).toBe(false);
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
  });
});
