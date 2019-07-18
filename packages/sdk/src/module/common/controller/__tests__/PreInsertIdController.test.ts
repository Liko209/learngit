/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 14:54:14
 * Copyright © RingCentral. All rights reserved.
 */

import PreInsertIdController from '../impl/PreInsertIdController';
import { daoManager } from '../../../../dao';
import { PostDao } from '../../../post/dao';

import { ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../../module/config');
jest.mock('../../../../dao');
jest.mock('../../../post/dao');

function getController(gValue: any = '') {
  ServiceLoader.getInstance = jest.fn().mockReturnValue({
    setUserId: jest.fn(),
    get: jest.fn().mockReturnValue(gValue),
    put: jest.fn(),
  });
  const postDao = new PostDao(null);
  daoManager.getDao.mockReturnValue(postDao);
  const controller = new PreInsertIdController(postDao.modelName);
  return controller;
}

describe('PreInsertIdController()', () => {
  beforeEach(() => {});
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('constructor()', () => {
    it('should return [] when new a PreInsertIdController instance', () => {
      const controller = getController();
      expect(controller.getAll()).toEqual({
        uniqueIds: [],
        ids: [],
      });
    });
    it('should clear old invalid data without error when they existed', () => {
      const controller = getController(['-61480964']);
      expect(controller.getAll()).toEqual({
        uniqueIds: [],
        ids: [],
      });
    });
  });

  describe('insert()', () => {
    it('should have data after insert ids', async () => {
      const controller = getController();
      await controller.insert('1001', 10);
      const all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['1001'],
        ids: [10],
      });
    });
  });

  describe('getPreInsertId()', () => {
    it('should return pre-insert id if unique id in pre-insert list', async () => {
      const controller = getController();
      await controller.insert('1001', 10);
      const result = controller.getPreInsertId('1001');
      expect(result).toEqual(10);
    });
  });

  describe('delete()', () => {
    it('should remove id from the map when it is existed in map', async () => {
      const controller = getController();
      await controller.insert('10', 10);
      let all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['10'],
        ids: [10],
      });
      await controller.delete('10');
      all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: [],
        ids: [],
      });
    });

    it('should do nothing when it is not existed in map', async () => {
      const controller = getController();
      await controller.insert('10', 10);
      let all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['10'],
        ids: [10],
      });
      await controller.delete('11');
      all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['10'],
        ids: [10],
      });
    });
  });

  describe('bulkDelete()', () => {
    it('should remove ids from the map when it is existed in map', async () => {
      const controller = getController();
      await controller.insert('111000', 10);
      await controller.insert('111001', 12);
      let all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['111000', '111001'],
        ids: [10, 12],
      });
      await controller.bulkDelete(['111000']);
      all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['111001'],
        ids: [12],
      });
    });

    it('should do nothing when ids not existed in map', async () => {
      const controller = getController();
      await controller.insert('111000', 10);
      await controller.insert('111001', 12);
      let all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['111000', '111001'],
        ids: [10, 12],
      });
      await controller.bulkDelete(['1110001']);
      all = controller.getAll();
      expect(all).toEqual({
        uniqueIds: ['111000', '111001'],
        ids: [10, 12],
      });
    });
  });
});
