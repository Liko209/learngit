/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 12:27:34
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../../../dao';
import { IItemService } from '../../../../service/IItemService';
import { LinkItemDao } from '../../dao/LinkItemDao';
import { LinkItemService } from '../LinkItemService';

jest.mock('../../controller/LinkItemController');
jest.mock('../../../../../../dao');
jest.mock('../../dao/LinkItemDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('LinkItemService', () => {
  const itemService = {};
  let linkItemService: LinkItemService;
  let linkItemDao: LinkItemDao;

  function setup() {
    linkItemDao = new LinkItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(linkItemDao);
    linkItemService = new LinkItemService(itemService as IItemService);
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  function setUpData() {
    const linkItem = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
      due: 999,
      assigned_to_ids: [1, 2],
      section: 'sec',
      color: '#1231',
    };

    return { linkItem };
  }

  describe('createItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and create it', async () => {
      const { linkItem } = setUpData();
      linkItemDao.put = jest.fn();
      await linkItemService.createItem(linkItem);
      expect(linkItemDao.put).toBeCalledWith({
        id: linkItem.id,
        group_ids: linkItem.group_ids,
        created_at: linkItem.created_at,
      });
    });
  });

  describe('updateItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and update it', async () => {
      const { linkItem } = setUpData();
      linkItemDao.update = jest.fn();
      await linkItemService.updateItem(linkItem);
      expect(linkItemDao.update).toBeCalledWith({
        id: linkItem.id,
        group_ids: linkItem.group_ids,
        created_at: linkItem.created_at,
      });
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should  delete it', async () => {
      const { linkItem } = setUpData();
      linkItemDao.delete = jest.fn();
      await linkItemService.deleteItem(linkItem.id);
      expect(linkItemDao.delete).toBeCalledWith(linkItem.id);
    });
  });

  describe('getSortedIds', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call dao and get id', async () => {
      const ids = [12, 33, 44];
      const options = { groupId: 1 };
      linkItemDao.getSortedIds = jest.fn().mockResolvedValue(ids);
      const res = await linkItemService.getSortedIds(options);
      expect(linkItemDao.getSortedIds).toBeCalledWith(options);
      expect(res).toEqual(ids);
    });
  });

  describe('getSubItemsCount', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call dao and get count', async () => {
      const groupId = 111;
      const cnt = 999;
      linkItemDao.getGroupItemCount = jest.fn().mockResolvedValue(cnt);
      expect(await linkItemService.getSubItemsCount(groupId)).toBe(cnt);
      expect(linkItemDao.getGroupItemCount).toBeCalledWith(groupId, undefined);
    });
  });
});
