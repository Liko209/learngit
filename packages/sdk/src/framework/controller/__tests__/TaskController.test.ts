/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-05-06 21:18:26
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskController } from '../impl/TaskController';
import { ITaskStrategy } from '../../strategy/ITaskStrategy';
import { jobScheduler, JOB_KEY } from '../../utils/jobSchedule';

class MockStrategy implements ITaskStrategy {
  private _strategy = [0.01, 0.02];
  private _retryTimes = 5;
  private _retryIndex: number = -1;
  private _executeTimes: number = 0;

  getNext(): number {
    if (this._retryIndex < this._strategy.length - 1) {
      this._retryIndex += 1;
    }
    this._executeTimes++;
    return this._strategy[this._retryIndex];
  }

  canNext(): boolean {
    return this._executeTimes < this._retryTimes;
  }

  reset(): void {
    this._retryIndex = -1;
  }

  getJobKey(): JOB_KEY {
    return JOB_KEY.INDEX_DATA;
  }

  setRetryTimes(times: number) {
    this._retryTimes = times;
  }
}

describe('TaskController', () => {
  let strategy: MockStrategy;
  let taskController: TaskController;
  function clearMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  }

  describe('start()', () => {
    beforeEach(() => {
      clearMocks();
    });
    it('should do nothing if task is in executing', () => {
      const executeFunc = () => {
        setTimeout(() => {
          strategy.reset();
        }, 200);
      };
      strategy = new MockStrategy();
      taskController = new TaskController(strategy, executeFunc);
      const resetSpy = jest.spyOn(strategy, 'reset');
      taskController.start();
      const isExecuting = taskController['_isExecuting'];
      expect(isExecuting).toEqual(true);
      expect(resetSpy).toBeCalled();
      taskController.start();
      expect(resetSpy).toBeCalledTimes(1);
    });

    it('should do retry if execute failed', async () => {
      const executeFunc = () => {
        throw new Error();
      };
      strategy = new MockStrategy();
      strategy.setRetryTimes(1);
      taskController = new TaskController(strategy, executeFunc);
      const retrySpy = jest.spyOn(taskController, '_retry');
      const createTaskFunSpy = jest.spyOn(taskController, '_createTaskFunc');
      await taskController.start();
      const isExecuting = taskController['_isExecuting'];
      expect(isExecuting).toEqual(false);
      expect(retrySpy).toBeCalled();
      expect(createTaskFunSpy).toBeCalled();
    });

    it('should not do retry if execute success', async () => {
      const executeFunc = () => {
        const a = 0;
        return a;
      };
      strategy = new MockStrategy();
      strategy.setRetryTimes(1);
      taskController = new TaskController(strategy, executeFunc);
      const retrySpy = jest.spyOn(taskController, '_retry');
      const createTaskFunSpy = jest.spyOn(taskController, '_createTaskFunc');
      await taskController.start();
      expect(retrySpy).not.toBeCalled();
      expect(createTaskFunSpy).not.toBeCalled();
    });

    it('should retry max times if execute failed', done => {
      const executeFunc = () => {
        throw new Error();
      };
      strategy = new MockStrategy();
      strategy.setRetryTimes(5);
      taskController = new TaskController(strategy, executeFunc);
      const createTaskFunSpy = jest.spyOn(taskController, '_createTaskFunc');
      const doExecutingFunSpy = jest.spyOn(taskController, '_doExecuting');
      taskController.start();
      setTimeout(() => {
        expect(createTaskFunSpy).toBeCalledTimes(1);
        expect(doExecutingFunSpy).toBeCalledTimes(6);
        done();
      }, 400);
    });

    it('should keep the last strategy and just do retry times if task still failed', done => {
      const executeFunc = () => {
        throw new Error();
      };
      strategy = new MockStrategy();
      taskController = new TaskController(strategy, executeFunc);
      const scheduleAndIgnoreFirstTimeSpy = jest.spyOn(
        jobScheduler,
        'scheduleAndIgnoreFirstTime',
      );
      taskController.start();
      setTimeout(() => {
        expect(scheduleAndIgnoreFirstTimeSpy).toBeCalledTimes(5);
        const retryStrategy = strategy['_strategy'];
        const interval = strategy.getNext();
        expect(interval).toEqual(retryStrategy[retryStrategy.length - 1]);
        done();
      }, 200);
    });
  });
});
