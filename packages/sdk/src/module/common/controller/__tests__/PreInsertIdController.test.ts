/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 14:54:14
 * Copyright © RingCentral. All rights reserved.
 */

import PreInsertIdController from '../impl/PreInsertIdController';
import { PostDao, daoManager, ConfigDao } from '../../../../dao';

jest.mock('../../../../dao');

function getController() {
  const postDao = new PostDao(null);
  daoManager.getDao.mockReturnValue(postDao);
  const controller = new PreInsertIdController(postDao.modelName);
  return controller;
}

describe('PreInsertIdController()', () => {
  beforeEach(() => {
    const configDao = new ConfigDao(null);
    daoManager.getKVDao.mockReturnValue(configDao);
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('constructor()', () => {
    it('should return [] when new a PreInsertIdController instance', () => {
      const controller = getController();
      expect(controller.getAll()).toEqual([]);
    });
  });

  describe('insert()', async () => {
    it('should have data after insert ids', async () => {
      const controller = getController();
      await controller.insert(10);
      const all = controller.getAll();
      expect(all).toEqual([10]);
    });
  });

  describe('delete()', async () => {
    it('should remove id from the map when it is existed in map', async () => {
      const controller = getController();
      await controller.insert(10);
      let all = controller.getAll();
      expect(all).toEqual([10]);
      await controller.delete(10);
      all = controller.getAll();
      expect(all).toEqual([]);
    });
    it('should do nothing when it is not existed in map', async () => {
      const controller = getController();
      await controller.insert(10);
      let all = controller.getAll();
      expect(all).toEqual([10]);
      await controller.delete(11);
      all = controller.getAll();
      expect(all).toEqual([10]);
    });
  });
});
