/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 08:09:09
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseSubItemService } from '../BaseSubItemService';
import { SubItemDao } from '../../dao';
import { daoManager, DeactivatedDao } from '../../../../../../dao';
import { TestDatabase } from '../../../../../../framework/controller/__tests__/TestTypes';

jest.mock('../../dao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('BaseSubItemService', () => {
  const subItemDao = new SubItemDao('', null);
  const deactivatedDao = new DeactivatedDao(new TestDatabase());
  jest.spyOn(daoManager, 'getDao').mockImplementation(() => {
    return deactivatedDao;
  });

  const baseSubItemService = new BaseSubItemService(subItemDao);

  beforeAll(async () => {
    clearMocks();
  });

  function setUpData() {
    const item = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
      start: 111,
      end: 222,
    };

    return { item };
  }

  describe('createItem', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should sanitize item and create it', async () => {
      const { item } = setUpData();
      subItemDao.put = jest.fn();
      await baseSubItemService.createItem(item);
      expect(subItemDao.put).toBeCalledWith({
        id: item.id,
        group_ids: item.group_ids,
        created_at: item.created_at,
      });
    });
  });

  describe('updateItem', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should sanitize item and update it', async () => {
      const { item } = setUpData();
      subItemDao.update = jest.fn();
      await baseSubItemService.updateItem(item);
      expect(subItemDao.update).toBeCalledWith({
        id: item.id,
        group_ids: item.group_ids,
        created_at: item.created_at,
      });
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should  delete it', async () => {
      const { item } = setUpData();
      subItemDao.delete = jest.fn();
      await baseSubItemService.deleteItem(item.id);
      expect(subItemDao.delete).toBeCalledWith(item.id);
    });
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
