/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-18 14:38:17
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskController } from '../../../framework/controller/impl/TaskController';
import { ITaskStrategy } from '../../../framework/strategy/ITaskStrategy';
import { IndexDataTaskStrategy } from '../strategy/IndexDataTaskStrategy';
import { mainLogger } from 'foundation/log';

const MAX_COUNT = 2;

const LOG_TAG = 'INDEX_TASK_CONTROLLER';
class IndexTaskController {
  private _taskControllerQueue: TaskController[] = [];
  private _executeFunc: () => Promise<void>;
  constructor(executeFunc: () => Promise<void>) {
    this._executeFunc = executeFunc;
  }

  async start() {
    const task = this._taskControllerQueue[0];
    if (this._taskControllerQueue.length < MAX_COUNT) {
      const newTask = this._getNewTask();
      this._taskControllerQueue.push(newTask);
    }
    mainLogger.tags(LOG_TAG).info('incomes new start');

    if (task) {
      if (!task.isExecuting()) {
        mainLogger.tags(LOG_TAG).info('clear old task');
        task.clear();
        this._taskControllerQueue.shift();
        this._onTaskArrived();
      }
    } else {
      this._onTaskArrived();
    }
  }

  private _onTaskArrived() {
    mainLogger.tags(LOG_TAG).info('new task arrived');
    const task = this._taskControllerQueue[0];
    if (task && !task.isExecuting()) {
      task.start(() => {
        const value = this._taskControllerQueue.shift();
        value && value.clear();
        this._onTaskArrived();
      });
    }
  }

  private _getNewTask() {
    const taskStrategy: ITaskStrategy = new IndexDataTaskStrategy();
    const taskController = new TaskController(taskStrategy, this._executeFunc);
    return taskController;
  }
}

export { IndexTaskController };
