/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 10:35:03
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../../../dao';
import { IItemService } from '../../../../service/IItemService';
import { TaskItemDao } from '../../dao/TaskItemDao';
import { TaskItemService } from '../TaskItemService';
import { TaskItem } from '../../entity';

jest.mock('../../controller/TaskItemController');
jest.mock('../../../../../../dao');
jest.mock('../../dao/TaskItemDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('TaskItemService', () => {
  const itemService = {};
  let taskItemService: TaskItemService;
  let taskItemDao: TaskItemDao;

  function setup() {
    taskItemDao = new TaskItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(taskItemDao);
    taskItemService = new TaskItemService(itemService as IItemService);
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  function setUpData() {
    const taskItem = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
      due: 999,
      assigned_to_ids: [1, 2],
      section: 'sec',
      color: '#1231',
    };

    return { taskItem };
  }

  describe('createItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and create it', async () => {
      const { taskItem } = setUpData();
      taskItemDao.put = jest.fn();
      await taskItemService.createItem(taskItem);
      expect(taskItemDao.put).toBeCalledWith({
        id: taskItem.id,
        group_ids: taskItem.group_ids,
        created_at: taskItem.created_at,
        due: taskItem.due,
        assigned_to_ids: taskItem.assigned_to_ids,
        section: taskItem.section,
        color: taskItem.color,
      });
    });
  });

  describe('updateItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and update it', async () => {
      const { taskItem } = setUpData();
      taskItemDao.update = jest.fn();
      await taskItemService.updateItem(taskItem);
      expect(taskItemDao.update).toBeCalledWith({
        id: taskItem.id,
        group_ids: taskItem.group_ids,
        created_at: taskItem.created_at,
        due: taskItem.due,
        assigned_to_ids: taskItem.assigned_to_ids,
        section: taskItem.section,
        color: taskItem.color,
      });
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should  delete it', async () => {
      const { taskItem } = setUpData();
      taskItemDao.delete = jest.fn();
      await taskItemService.deleteItem(taskItem.id);
      expect(taskItemDao.delete).toBeCalledWith(taskItem.id);
    });
  });

  describe('getSortedIds', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call dao and get id', async () => {
      const { taskItem } = setUpData();
      const ids = [12, 33, 44];
      const options = { groupId: 1 };
      taskItemDao.getSortedIds = jest.fn().mockResolvedValue(ids);
      const res = await taskItemService.getSortedIds(options);
      expect(taskItemDao.getSortedIds).toBeCalledWith(options);
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
      taskItemDao.getGroupItemCount = jest.fn().mockResolvedValue(cnt);
      expect(await taskItemService.getSubItemsCount(groupId)).toBe(cnt);
      expect(taskItemDao.getGroupItemCount).toBeCalledWith(groupId, undefined);
    });
  });
});
