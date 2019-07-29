/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 08:09:09
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseSubItemService } from '../BaseSubItemService';
import { SubItemDao } from '../../dao';
import { daoManager, DeactivatedDao } from '../../../../../../dao';

jest.mock('../../dao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('BaseSubItemService', () => {
  const subItemDao = new SubItemDao('', null);
  const deactivatedDao = new DeactivatedDao(null);
  jest.spyOn(daoManager, 'getDao').mockImplementation(() => {
    return deactivatedDao;
  });

  const baseSubItemService = new BaseSubItemService(subItemDao);

  beforeAll(async () => {
    clearMocks();
  });

  describe('getSortedIds', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should call dao and get id', async () => {
      const ids = [12, 33, 44];
      const options = { groupId: 1 };
      subItemDao.getSortedIds = jest.fn().mockResolvedValue(ids);
      const res = await baseSubItemService.getSortedIds(options);
      expect(subItemDao.getSortedIds).toBeCalledWith(options);
      expect(res).toEqual(ids);
    });
  });

  describe('getSubItemsCount', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should call dao and get count', async () => {
      const groupId = 111;
      const cnt = 999;
      subItemDao.getGroupItemCount = jest.fn().mockResolvedValue(cnt);
      expect(await baseSubItemService.getSubItemsCount(groupId)).toBe(cnt);
      expect(subItemDao.getGroupItemCount).toBeCalledWith(groupId, undefined);
    });
  });
});
