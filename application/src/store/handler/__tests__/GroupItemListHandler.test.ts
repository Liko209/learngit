/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-09 06:59:01
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupItemListHandler } from '../GroupItemListHandler';
import { ItemService } from 'sdk/module/item/service';
import { ITEM_SORT_KEYS } from 'sdk/module/item/constants';

jest.mock('sdk/module/item/service');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('GroupItemListHandler', () => {
  const groupId = 123123;
  let groupItemListHandler: GroupItemListHandler;
  const itemService = new ItemService();

  function setup() {
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('totalCount()', () => {
    it('should get total count from item service', async () => {
      groupItemListHandler = new GroupItemListHandler(
        groupId,
        10,
        ITEM_SORT_KEYS.NAME,
        true,
      );

      itemService.getGroupItemsCount = jest.fn().mockResolvedValue(1);
      expect(await groupItemListHandler.totalCount()).toBe(1);
      expect(itemService.getGroupItemsCount).toBeCalled();
    });
  });

  describe('fetchNextPageItems()', () => {
    function setUpData() {
      const item1 = {
        id: 1,
        group_ids: [groupId],
        created_at: 1,
        name: 'item1',
      };
      const item2 = {
        id: 2,
        group_ids: [groupId],
        created_at: 2,
        name: 'item2',
      };

      const item3 = {
        id: 3,
        group_ids: [groupId],
        created_at: 3,
        name: 'item3',
      };
      const items = [item1, item2, item3];
      return { items };
    }

    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return call item service and get result', async () => {
      const { items } = setUpData();
      itemService.getItems = jest.fn().mockResolvedValue(items);
      groupItemListHandler = new GroupItemListHandler(
        groupId,
        10,
        ITEM_SORT_KEYS.NAME,
        true,
      );
      const res = await groupItemListHandler.fetchNextPageItems();
      expect(res).toEqual(items);
    });
  });
});
