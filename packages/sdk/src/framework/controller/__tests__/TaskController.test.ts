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
}

describe('TaskController', () => {
  const strategy: MockStrategy = new MockStrategy();
  const taskController: TaskController = new TaskController(strategy);
  function clearMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    strategy.reset();
  }

  describe('start()', () => {
    beforeEach(() => {
      clearMocks();
    });
    it('should do nothing if task is in executing', () => {
      const executeFunc = () => {
        setTimeout(() => {
          strategy.reset();
        },         200);
      };
      jest.spyOn(strategy, 'canNext').mockReturnValue(true);
      const resetSpy = jest.spyOn(taskController, 'reset');
      taskController.start(executeFunc);
      const isExecuting = taskController['_isExecuting'];
      expect(isExecuting).toEqual(true);
      expect(resetSpy).toBeCalled();
      taskController.start(executeFunc);
      expect(resetSpy).toBeCalledTimes(1);
    });

    it('should keep the last strategy and just do retry times if task still failed', () => {
      const executeFunc = () => {
        throw new Error();
      };
      const scheduleJobSpy = jest.spyOn(jobScheduler, 'scheduleJob');
      const scheduleAndIgnoreFirstTimeSpy = jest.spyOn(
        jobScheduler,
        'scheduleAndIgnoreFirstTime',
      );
      taskController.start(executeFunc);
      setTimeout(() => {
        expect(scheduleJobSpy).toBeCalledTimes(1);
        expect(scheduleAndIgnoreFirstTimeSpy).toBeCalledTimes(5);
        expect(scheduleJobSpy).toBeCalledWith({
          executeFunc,
          key: JOB_KEY.INDEX_DATA,
          needNetwork: false,
          intervalSeconds: 0,
          periodic: false,
        });
        expect(scheduleAndIgnoreFirstTimeSpy).toHaveBeenLastCalledWith({
          executeFunc,
          key: JOB_KEY.INDEX_DATA,
          needNetwork: false,
          intervalSeconds: 0.02,
          periodic: false,
        });
      },         200);
    });
  });

  describe('reset()', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should reset strategy and call cancelJob when call reset api', () => {
      const executeFunc = () => {
        throw new Error();
      };
      taskController.start(executeFunc);
      setTimeout(() => {
        taskController.reset();
        const isExecuting = taskController['_isExecuting'];
        const resetSpy = jest.spyOn(strategy, 'reset');
        const cancelJobSpy = jest.spyOn(jobScheduler, 'cancelJob');
        expect(isExecuting).toEqual(false);
        expect(resetSpy).toHaveBeenCalled();
        expect(cancelJobSpy).toHaveBeenCalled();
      },         200);
    });
  });
});
