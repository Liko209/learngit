/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 10:35:03
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../../../dao';
import { IItemService } from '../../../../service/IItemService';
import { TaskItemDao } from '../../dao/TaskItemDao';
import { TaskItemService } from '../TaskItemService';

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
      complete: true,
    };

    return { taskItem };
  }

  describe('toSanitizedItem', () => {
    const { taskItem } = setUpData();
    it('should return sanitized item', () => {
      expect(taskItemService.toSanitizedItem(taskItem)).toEqual({
        id: taskItem.id,
        group_ids: taskItem.group_ids,
        created_at: taskItem.created_at,
        complete: taskItem.complete,
        due: taskItem.due,
        assigned_to_ids: taskItem.assigned_to_ids,
        color: taskItem.color,
      });
    });
  });
});
