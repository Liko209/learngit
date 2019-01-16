/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 12:31:11
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../../../dao';
import { IItemService } from '../../../../service/IItemService';
import { EventItemDao } from '../../dao/EventItemDao';
import { EventItemService } from '../EventItemService';
import { EventItem } from '../../entity';

jest.mock('../../../../../../dao');
jest.mock('../../dao/EventItemDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('EventItemService', () => {
  const itemService = {};
  let eventItemService: EventItemService;
  let eventItemDao: EventItemDao;

  function setup() {
    eventItemDao = new EventItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(eventItemDao);
    eventItemService = new EventItemService(itemService as IItemService);
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  function setUpData() {
    const eventItem = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
    };

    return { eventItem };
  }

  describe('createItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and create it', async () => {
      const { eventItem } = setUpData();
      eventItemDao.put = jest.fn();
      await eventItemService.createItem(eventItem);
      expect(eventItemDao.put).toBeCalledWith({
        id: eventItem.id,
        group_ids: eventItem.group_ids,
        created_at: eventItem.created_at,
      });
    });
  });

  describe('updateItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and update it', async () => {
      const { eventItem } = setUpData();
      eventItemDao.update = jest.fn();
      await eventItemService.updateItem(eventItem);
      expect(eventItemDao.update).toBeCalledWith({
        id: eventItem.id,
        group_ids: eventItem.group_ids,
        created_at: eventItem.created_at,
        due: eventItem.due,
        assigned_to_ids: eventItem.assigned_to_ids,
        section: eventItem.section,
        color: eventItem.color,
      });
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should  delete it', async () => {
      const { eventItem } = setUpData();
      eventItemDao.delete = jest.fn();
      await eventItemService.deleteItem(eventItem.id);
      expect(eventItemDao.delete).toBeCalledWith(eventItem.id);
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
      eventItemDao.getSortedIds = jest.fn().mockResolvedValue(ids);
      const res = await eventItemService.getSortedIds(options);
      expect(eventItemDao.getSortedIds).toBeCalledWith(options);
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
      eventItemDao.getGroupItemCount = jest.fn().mockResolvedValue(cnt);
      expect(await eventItemService.getSubItemsCount(groupId)).toBe(cnt);
      expect(eventItemDao.getGroupItemCount).toBeCalledWith(groupId, undefined);
    });
  });
});
