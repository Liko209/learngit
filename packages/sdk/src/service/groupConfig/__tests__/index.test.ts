/// <reference path="../../../__tests__/types.d.ts" />
/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-27 11:15:14
 * Copyright © RingCentral. All rights reserved.
 */
import GroupConfigService from '..';
import { daoManager, GroupConfigDao } from '../../../dao';
jest.mock('../../../dao');
describe('GroupConfigService', () => {
  const groupConfigService: GroupConfigService = new GroupConfigService();
  const groupConfigDao = new GroupConfigDao(null);
  beforeEach(() => {
    daoManager.getDao.mockReturnValueOnce(groupConfigDao);
  });
  describe('updateGroupConfigPartialData', () => {
    it('should return back groupConfig', async () => {
      const mock = {
        id: 2,
        draft: 'draft',
      };
      jest.spyOn(groupConfigDao, 'get').mockResolvedValueOnce(mock);

      const data = await groupConfigService.getById(2);
      expect(data).toEqual(mock);
    });
  });
  describe('updateDraft', () => {
    it('should call updateGroupConfigPartialData when groupConfig has exited', async () => {
      let hasBeenCalled = false;
      jest
        .spyOn(groupConfigService, 'updateGroupConfigPartialData')
        .mockImplementation(() => {
          hasBeenCalled = true;
        });
      groupConfigDao.get.mockResolvedValueOnce({ id: 2 });
      await groupConfigService.updateDraft({ id: 2, draft: '' });
      expect(hasBeenCalled).toBeTruthy();
    });
  });
  describe('getDraft', () => {
    it('should return empty string when there is groupConfig in DB', async () => {
      groupConfigDao.get.mockResolvedValueOnce(null);
      const result = await groupConfigService.getDraft(1);
      expect(result).toEqual('');
    });
    it('should return empty string when there is draft in groupConfig', async () => {
      groupConfigDao.get.mockResolvedValueOnce({ id: 1 });
      const result = await groupConfigService.getDraft(1);
      expect(result).toEqual('');
    });
    it('should return draft', async () => {
      groupConfigDao.get.mockResolvedValueOnce({ id: 1, draft: '123' });
      const result = await groupConfigService.getDraft(1);
      expect(result).toEqual('123');
    });
  });

  describe('getGroupSendFailurePostIds', () => {
    it('should return failure post ids ', async () => {
      const mock = { id: 1, send_failure_post_ids: [12, 13] };
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
      groupConfigDao.get.mockResolvedValueOnce(mock);
      const result = await groupConfigService.getGroupSendFailurePostIds(1);
      expect(result).toEqual(mock.send_failure_post_ids);
    });

    it('should return error when groupConfigDao error', async () => {
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
      groupConfigDao.get.mockRejectedValueOnce(new Error());
      await expect(
        groupConfigService.getGroupSendFailurePostIds(1),
      ).rejects.toThrow();
    });
  });

  describe('updateGroupSendFailurePostIds', () => {
    it('should call updateGroupConfigPartialData when there has local groupConfig', async () => {
      await groupConfigService.updateGroupSendFailurePostIds({
        id: 2,
        send_failure_post_ids: [],
      });
      groupConfigDao.get.mockResolvedValueOnce({ id: 2 });
      await expect(
        groupConfigService.updateGroupConfigPartialData,
      ).toHaveBeenCalled();
    });
  });

  describe('saveAndDoNotify', () => {
    it('should call updateGroupConfigPartialData when there has local groupConfig', async () => {
      groupConfigDao.get.mockResolvedValueOnce(undefined);
      await groupConfigService.saveAndDoNotify({ id: 1, draft: '' });
      expect(
        groupConfigService.updateGroupConfigPartialData,
      ).toHaveBeenCalled();
    });
    it('should call groupConfigDao.update where there is not local groupConfig', async () => {
      groupConfigDao.get.mockResolvedValueOnce({ id: 1 });
      await groupConfigService.saveAndDoNotify({ id: 1, draft: '1' });
      expect(groupConfigDao.update).toHaveBeenCalled();
    });
  });
});
