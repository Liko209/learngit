/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 10:35:03
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../../../dao';
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
  let taskItemService: TaskItemService;
  let taskItemDao: TaskItemDao;

  function setup() {
    taskItemDao = new TaskItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(taskItemDao);
    taskItemService = new TaskItemService();
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('TaskItemService', () => {
    it('should be instance of TaskItemService', () => {
      expect(taskItemService).toBeInstanceOf(TaskItemService);
    });
  });
});
