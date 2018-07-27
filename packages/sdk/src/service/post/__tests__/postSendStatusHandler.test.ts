/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-05-23 15:20:46
 */

/// <reference path="../../../__tests__/types.d.ts" />

import { ESendStatus, PostSendStatusHandler } from '../postSendStatusHandler';
import { daoManager, PostDao } from '../../../dao';

jest.mock('../../../dao');
jest.mock('../../post');
jest.mock('../../../api/glip/state');

describe('StateService', () => {
  const statusService = new PostSendStatusHandler();
  const postDao = new PostDao(null);
  daoManager.getDao.mockReturnValue(postDao);
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Get status', () => {
    it('Get status from local DB', async () => {
      postDao.queryPreInsertPost.mockResolvedValue([{ id: -99, version: 99 }]);
      let status = await statusService.getStatus(-99);
      expect(status).toBe(ESendStatus.FAIL);
      let obj = await statusService.isVersionInPreInsert(99);
      expect(obj.existed).toBe(true);

      status = await statusService.getStatus(-90);
      expect(status).toBe(ESendStatus.FAIL);

      obj = await statusService.isVersionInPreInsert(100);
      expect(obj.existed).toBe(false);
    });

    it('Get status without id in it', async () => {
      let status = await statusService.getStatus(11);
      expect(status).toBe(ESendStatus.SUCCESS);
      status = await statusService.getStatus(-11);
      expect(status).toBe(ESendStatus.FAIL);
    });

    it('Get status with id in it and clear', async () => {
      statusService.addIdAndVersion(-123123, 123123);
      let status = await statusService.getStatus(-123123);
      expect(status).toBe(ESendStatus.INPROGRESS);

      statusService.clear();
      status = await statusService.getStatus(123123);
      expect(status).toBe(ESendStatus.SUCCESS);
    });

    it('Remove version in status', async () => {
      statusService.addIdAndVersion(-1, 1);
      statusService.addIdAndVersion(-1, 1);
      let status = await statusService.getStatus(-1);
      expect(status).toBe(ESendStatus.INPROGRESS);

      statusService.removeVersion(1);
      statusService.removeVersion(1111);
      status = await statusService.getStatus(-1);
      expect(status).toBe(ESendStatus.FAIL);
    });
  });
});
