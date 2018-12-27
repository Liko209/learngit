/// <reference path="../../../__tests__/types.d.ts" />
/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-27 11:15:14
 * Copyright © RingCentral. All rights reserved.
 */
import GroupConfigService from '../index';
import { daoManager, GroupConfigDao } from '../../../dao';
jest.mock('../../../dao');
describe('GroupConfigService', () => {
  const groupConfigService: GroupConfigService = new GroupConfigService();
  const groupConfigDao = new GroupConfigDao(null);
  describe('updateGroupConfigPartialData', () => {
    it('should return back groupConfig', async () => {
      const mock = {
        id: 2,
        draft: 'draft',
      };
      jest
        .spyOn(groupConfigService, 'getByIdFromDao')
        .mockResolvedValueOnce(mock);

      const data = await groupConfigService.getById(2);
      expect(data).toEqual(mock);
    });
  });
  describe('updateDraft', () => {
    it('should call updateGroupConfigPartialData when updateDraft', async () => {
      let hasBeenCalled = false;
      jest
        .spyOn(groupConfigService, 'updateGroupConfigPartialData')
        .mockImplementation(() => {
          hasBeenCalled = true;
        });
      await groupConfigService.updateDraft({ id: 1, draft: '' });
      expect(hasBeenCalled).toBeTruthy();
    });
  });
  describe('getDraft', () => {
    beforeEach(() => {
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
    });
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
});
