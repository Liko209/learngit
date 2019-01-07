/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 14:54:14
 * Copyright © RingCentral. All rights reserved.
 */

import PreInsertIdController from '../PreInsertIdController';
import { PostDao, daoManager, ConfigDao } from '../../../../dao';

jest.mock('../../../../dao');

describe('PreInsertIdController', () => {
  beforeEach(() => {
    const postDao = new PostDao(null);
    daoManager.getDao.mockReturnValue(postDao);
    const configDao = new ConfigDao(null);
    daoManager.getKVDao.mockReturnValue(configDao);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('constructor', () => {
    it('should return {} when new a PreInsertIdController instance', () => {
      const controller = new PreInsertIdController(PostDao);
      expect(controller.getAll()).toEqual({});
    });
  });
  describe('insertId', async () => {
    it('should have data after insert ids', async () => {
      const controller = new PreInsertIdController(PostDao);
      const mock = { version: 10, id: -1 };
      await controller.insertId(mock);
      const all = controller.getAll();
      expect(all).toEqual({ 10: -1 });
    });
  });
  describe('removeIdByVersion', async () => {
    it('should remove id from the map when it is existed in map', async () => {
      const controller = new PreInsertIdController(PostDao);
      const mock = { version: 10, id: -1 };
      await controller.insertId(mock);
      let all = controller.getAll();
      expect(all).toEqual({ 10: -1 });
      await controller.removeIdByVersion(10);
      all = controller.getAll();
      expect(all).toEqual({});
    });
    it('should do nothing when it is not existed in map', async () => {
      const controller = new PreInsertIdController(PostDao);
      const mock = { version: 10, id: -1 };
      await controller.insertId(mock);
      let all = controller.getAll();
      expect(all).toEqual({ 10: -1 });
      await controller.removeIdByVersion(11);
      all = controller.getAll();
      expect(all).toEqual({ 10: -1 });
    });
  });
});
