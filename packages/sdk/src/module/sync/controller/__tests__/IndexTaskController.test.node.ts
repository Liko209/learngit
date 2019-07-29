/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-18 17:53:16
 * Copyright © RingCentral. All rights reserved.
 */

import { IndexTaskController } from '../IndexTaskController';
import { TaskController } from '../../../../framework/controller/impl/TaskController';

jest.mock('../../../../framework/controller/impl/TaskController');

describe('IndexTaskController', () => {
  describe('start', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
    it('should call start immediately if it is the first task', async () => {
      const taskController = new IndexTaskController(async () => {});
      const task = new TaskController(undefined, undefined);
      task.start = jest.fn().mockResolvedValueOnce();
      jest.spyOn(taskController, '_getNewTask').mockReturnValueOnce(task);
      await taskController.start();
      expect(task.start).toHaveBeenCalled();
    });
    it('should call task1 clear if task is on pending and call task2', async () => {
      const taskController = new IndexTaskController(async () => {});
      const task1 = new TaskController(undefined, undefined);
      task1.clear = jest.fn().mockReturnValueOnce(true);
      taskController['_taskControllerQueue'] = [task1];

      const task2 = new TaskController(undefined, undefined);
      task2.start = jest.fn().mockResolvedValueOnce(true);
      jest.spyOn(taskController, '_getNewTask').mockReturnValueOnce(task2);

      await taskController.start();
      expect(task1.clear).toHaveBeenCalled();
      expect(task2.start).toHaveBeenCalled();
    });

    it('should do nothing when incomes new task when former task is executing', async () => {
      const taskController = new IndexTaskController(async () => {});
      const task1 = new TaskController(undefined, undefined);
      task1.isExecuting = jest.fn().mockReturnValueOnce(true);
      taskController['_taskControllerQueue'] = [task1];
      jest.spyOn(taskController, '_onTaskArrived').mockResolvedValueOnce();
      await taskController.start();
      expect(taskController['_onTaskArrived']).not.toHaveBeenCalled();
    });
  });
});
