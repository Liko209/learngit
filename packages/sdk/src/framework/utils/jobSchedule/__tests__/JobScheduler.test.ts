/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-05 09:55:29
 * Copyright © RingCentral. All rights reserved.
 */

import { JobScheduler } from '../JobScheduler';
import { JobInfo } from '../types';
import { JOB_KEY, DailyJobIntervalSeconds } from '../constants';

describe('JobScheduler', () => {
  let jobScheduler: JobScheduler;

  beforeEach(() => {
    jobScheduler = new JobScheduler();
  });

  describe('onNetWorkChanged()', () => {
    it('should set network status', () => {
      expect(jobScheduler['_isOnline']).toBeTruthy();
      jobScheduler.onNetWorkChanged(false);
      expect(jobScheduler['_isOnline']).toBeFalsy();
      jobScheduler.onNetWorkChanged(true);
      expect(jobScheduler['_isOnline']).toBeTruthy();
    });

    it('should check all network jobs', () => {
      const infos = [
        {
          key: JOB_KEY.FETCH_CLIENT_INFO,
          intervalSeconds: DailyJobIntervalSeconds,
          periodic: true,
          retryTime: 0,
          executeFunc: () => {},
          needNetwork: false,
        },
        {
          key: JOB_KEY.FETCH_ACCOUNT_INFO,
          intervalSeconds: DailyJobIntervalSeconds,
          periodic: true,
          retryTime: 0,
          executeFunc: () => {},
          needNetwork: true,
        },
        {
          key: JOB_KEY.FETCH_EXTENSION_INFO,
          intervalSeconds: DailyJobIntervalSeconds,
          periodic: true,
          retryTime: 0,
          executeFunc: () => {},
          needNetwork: true,
        },
      ];
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_CLIENT_INFO, infos[0]);
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_ACCOUNT_INFO, infos[1]);
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_EXTENSION_INFO, infos[2]);
      jobScheduler['_canExecute'] = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      jobScheduler['_getLastSuccessTime'] = jest
        .fn()
        .mockReturnValueOnce(123)
        .mockReturnValueOnce(456);
      jobScheduler['_execute'] = jest.fn();
      jobScheduler.onNetWorkChanged(true);
      expect(jobScheduler['_isOnline']).toBeTruthy();
      expect(jobScheduler['_canExecute']).toBeCalledWith(infos[1], 123);
      expect(jobScheduler['_canExecute']).toBeCalledWith(infos[2], 456);
      expect(jobScheduler['_getLastSuccessTime']).toBeCalledTimes(2);
      expect(jobScheduler['_execute']).toBeCalledTimes(1);
    });
  });

  describe('scheduleDailyPeriodicJob()', () => {
    it('should schedule daily job', () => {
      jobScheduler.scheduleJob = jest.fn();
      jobScheduler.scheduleAndIgnoreFirstTime = jest.fn();
      const mockFunc = () => {};
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_PHONE_DATA,
        mockFunc,
        false,
        false,
      );
      expect(jobScheduler.scheduleAndIgnoreFirstTime).not.toBeCalled();
      expect(jobScheduler.scheduleJob).toBeCalledWith({
        key: JOB_KEY.FETCH_PHONE_DATA,
        executeFunc: mockFunc,
        needNetwork: false,
        intervalSeconds: DailyJobIntervalSeconds,
        periodic: true,
      });
    });

    it('should schedule daily job and ignore first time', () => {
      jobScheduler.scheduleJob = jest.fn();
      jobScheduler.scheduleAndIgnoreFirstTime = jest.fn();
      const mockFunc = () => {};
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_PHONE_DATA,
        mockFunc,
        false,
        true,
      );
      expect(jobScheduler.scheduleJob).not.toBeCalled();
      expect(jobScheduler.scheduleAndIgnoreFirstTime).toBeCalledWith({
        key: JOB_KEY.FETCH_PHONE_DATA,
        executeFunc: mockFunc,
        needNetwork: false,
        intervalSeconds: DailyJobIntervalSeconds,
        periodic: true,
      });
    });

    it('should schedule daily job and ignore first time', () => {
      jobScheduler.scheduleJob = jest.fn();
      jobScheduler.scheduleAndIgnoreFirstTime = jest.fn();
      const mockFunc = () => {};
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_PHONE_DATA,
        mockFunc,
        false,
        true,
      );
      expect(jobScheduler.scheduleJob).not.toBeCalled();
      expect(jobScheduler.scheduleAndIgnoreFirstTime).toBeCalledWith({
        key: JOB_KEY.FETCH_PHONE_DATA,
        executeFunc: mockFunc,
        needNetwork: false,
        intervalSeconds: DailyJobIntervalSeconds,
        periodic: true,
      });
    });
  });

  describe('scheduleJob()', () => {
    it('should cancel old job when duplicate', () => {
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_CLIENT_INFO, {} as JobInfo);
      jobScheduler.cancelJob = jest.fn();
      jobScheduler.scheduleJob({ key: JOB_KEY.FETCH_CLIENT_INFO } as JobInfo);
      expect(jobScheduler.cancelJob).toBeCalledWith(
        JOB_KEY.FETCH_CLIENT_INFO,
        false,
      );
    });

    it('should execute right now when force = true', () => {
      const info = { key: JOB_KEY.FETCH_CLIENT_INFO } as JobInfo;
      jobScheduler.cancelJob = jest.fn();
      jobScheduler['_execute'] = jest.fn();
      jobScheduler.scheduleJob(info, true);
      expect(jobScheduler.cancelJob).toBeCalledTimes(0);
      expect(jobScheduler['_jobMap'].get(JOB_KEY.FETCH_CLIENT_INFO)).toEqual(
        info,
      );
      expect(jobScheduler['_execute']).toBeCalledWith(info);
    });

    it('should execute right now when can execute', () => {
      const info = { key: JOB_KEY.FETCH_CLIENT_INFO } as JobInfo;
      jobScheduler.cancelJob = jest.fn();
      jobScheduler['_execute'] = jest.fn();
      jobScheduler['_getLastSuccessTime'] = jest
        .fn()
        .mockReturnValueOnce(12345);
      jobScheduler['_canExecute'] = jest.fn().mockReturnValueOnce(true);
      jobScheduler.scheduleJob(info);
      expect(jobScheduler.cancelJob).toBeCalledTimes(0);
      expect(jobScheduler['_jobMap'].get(JOB_KEY.FETCH_CLIENT_INFO)).toEqual(
        info,
      );
      expect(jobScheduler['_getLastSuccessTime']).toBeCalledTimes(1);
      expect(jobScheduler['_canExecute']).toBeCalledWith(info, 12345);
      expect(jobScheduler['_execute']).toBeCalledWith(info);
    });

    it('should set timer when can not execute', () => {
      const info = {
        key: JOB_KEY.FETCH_CLIENT_INFO,
        intervalSeconds: 23,
      } as JobInfo;
      jobScheduler.cancelJob = jest.fn();
      jobScheduler['_execute'] = jest.fn();
      jobScheduler['_getLastSuccessTime'] = jest
        .fn()
        .mockReturnValueOnce(12345);
      jobScheduler['_canExecute'] = jest.fn().mockReturnValueOnce(false);
      jobScheduler['_setTimer'] = jest.fn().mockReturnValueOnce(888);
      jobScheduler.scheduleJob(info);
      expect(jobScheduler.cancelJob).toBeCalledTimes(0);
      expect(jobScheduler['_jobMap'].get(JOB_KEY.FETCH_CLIENT_INFO)).toEqual(
        info,
      );
      expect(jobScheduler['_getLastSuccessTime']).toBeCalledTimes(1);
      expect(jobScheduler['_canExecute']).toBeCalledWith(info, 12345);
      expect(jobScheduler['_execute']).toBeCalledTimes(0);
      expect(jobScheduler['_setTimer']).toBeCalledWith(info, 23000);
    });
  });

  describe('scheduleAndIgnoreFirstTime()', () => {
    it('should call preSchedule and setTimer', () => {
      jobScheduler.preSchedule = jest.fn();
      jobScheduler['_setTimer'] = jest.fn();
      jobScheduler['_setLastSuccessTime'] = jest.fn();
      const info = {
        key: JOB_KEY.FETCH_CLIENT_INFO,
        intervalSeconds: 43,
        periodic: true,
      } as JobInfo;
      jobScheduler.scheduleAndIgnoreFirstTime(info);
      expect(jobScheduler.preSchedule).toBeCalledWith(info);
      expect(jobScheduler['_setTimer']).toBeCalledWith(
        info,
        info.intervalSeconds * 1000,
      );
      expect(jobScheduler['_setLastSuccessTime']).toBeCalled();
    });
  });

  describe('cancelJob()', () => {
    it('should cancel job when job is exist', () => {
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_CLIENT_INFO, {} as JobInfo);
      jobScheduler.cancelJob(JOB_KEY.FETCH_CLIENT_INFO);
      expect(jobScheduler['_jobMap'].size).toEqual(0);
    });

    it('should remove last success time when flag is true', () => {
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_CLIENT_INFO, {} as JobInfo);
      jobScheduler['_removeLastSuccessTime'] = jest.fn();
      jobScheduler.cancelJob(JOB_KEY.FETCH_CLIENT_INFO, true);
      expect(jobScheduler['_jobMap'].size).toEqual(0);
      expect(jobScheduler['_removeLastSuccessTime']).toBeCalledWith(
        JOB_KEY.FETCH_CLIENT_INFO,
      );
    });
  });

  describe('clear()', () => {
    it('should clear all jobs', () => {
      const infos = [
        {
          key: JOB_KEY.FETCH_CLIENT_INFO,
          intervalSeconds: DailyJobIntervalSeconds,
          periodic: true,
          retryTime: 0,
          executeFunc: () => {},
          needNetwork: false,
        },
        {
          key: JOB_KEY.FETCH_ACCOUNT_INFO,
          intervalSeconds: DailyJobIntervalSeconds,
          periodic: true,
          retryTime: 0,
          executeFunc: () => {},
          needNetwork: true,
        },
        {
          key: JOB_KEY.FETCH_EXTENSION_INFO,
          intervalSeconds: DailyJobIntervalSeconds,
          periodic: true,
          retryTime: 0,
          executeFunc: () => {},
          needNetwork: true,
        },
      ];
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_CLIENT_INFO, infos[0]);
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_ACCOUNT_INFO, infos[1]);
      jobScheduler['_jobMap'].set(JOB_KEY.FETCH_EXTENSION_INFO, infos[2]);
      jobScheduler.clear();
      expect(jobScheduler['_jobMap'].size).toEqual(0);
    });
  });

  describe('_userConfig', () => {
    it('should call userConfig', () => {
      jobScheduler['_userConfig'] = {
        getLastSuccessTime: jest.fn(),
        setLastSuccessTime: jest.fn(),
        removeLastSuccessTime: jest.fn(),
      } as any;
      jobScheduler['_getLastSuccessTime'](JOB_KEY.FETCH_ACCOUNT_INFO);
      expect(jobScheduler['_userConfig'].getLastSuccessTime).toBeCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
      );
      jobScheduler['_setLastSuccessTime'](JOB_KEY.FETCH_ACCOUNT_INFO, 666);
      expect(jobScheduler['_userConfig'].setLastSuccessTime).toBeCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        666,
      );
      jobScheduler['_removeLastSuccessTime'](JOB_KEY.FETCH_ACCOUNT_INFO);
      expect(jobScheduler['_userConfig'].removeLastSuccessTime).toBeCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
      );
    });
  });

  describe('_canExecute', () => {
    it('should return false when job need network and is offline', () => {
      const info = { needNetwork: true } as JobInfo;
      jobScheduler['_isOnline'] = false;
      expect(jobScheduler['_canExecute'](info, 123)).toBeFalsy();
    });

    it('should return true when job can execute', () => {
      const info = { needNetwork: true, intervalSeconds: 60 } as JobInfo;
      jobScheduler['_isOnline'] = true;
      const lastSuccessTime = Date.now() - 60000;
      expect(jobScheduler['_canExecute'](info, lastSuccessTime)).toBeTruthy();
    });
  });

  describe('_execute', () => {
    it('should do nothing when isExecuting = true or isDropt = true', () => {
      const info = {
        key: JOB_KEY.FETCH_ACCOUNT_INFO,
        isExecuting: true,
        isDropt: true,
        periodic: true,
        intervalSeconds: 60,
        retryTime: 0,
        executeFunc: jest.fn(),
      } as any;
      jobScheduler['_execute'](info);
      expect(info.executeFunc).toBeCalledTimes(0);
      info.isExecuting = false;
      jobScheduler['_execute'](info);
      expect(info.executeFunc).toBeCalledTimes(0);
      info.isDropt = false;
      jobScheduler['_execute'](info);
      expect(info.executeFunc).toBeCalledTimes(1);
    });

    it('should set success time and timer when execute success and periodic = true ', () => {
      const info = {
        key: JOB_KEY.FETCH_ACCOUNT_INFO,
        isExecuting: false,
        isDropt: false,
        periodic: true,
        intervalSeconds: 60,
        retryTime: 0,
        jobId: 0,
        executeFunc: (callback: (successful: boolean) => void) => {
          callback(true);
        },
      } as any;
      jobScheduler['_setLastSuccessTime'] = jest.fn();
      jobScheduler['_setTimer'] = jest.fn().mockReturnValueOnce(455);
      jobScheduler['_execute'](info);
      expect(jobScheduler['_setLastSuccessTime']).toBeCalledTimes(1);
      expect(jobScheduler['_setTimer']).toBeCalledWith(info, 60000);
      expect(info.jobId).toEqual(455);
    });

    it('should remove job when execute success and periodic = false ', () => {
      const info = {
        key: JOB_KEY.FETCH_ACCOUNT_INFO,
        isExecuting: false,
        isDropt: false,
        periodic: false,
        intervalSeconds: 60,
        retryTime: 0,
        jobId: 0,
        executeFunc: (callback: (successful: boolean) => void) => {
          callback(true);
        },
      } as any;
      jobScheduler['_setLastSuccessTime'] = jest.fn();
      jobScheduler['_setTimer'] = jest.fn().mockReturnValueOnce(455);
      jobScheduler.cancelJob = jest.fn();
      jobScheduler['_execute'](info);
      expect(jobScheduler['_setLastSuccessTime']).toBeCalledTimes(0);
      expect(jobScheduler['_setTimer']).toBeCalledTimes(0);
      expect(jobScheduler.cancelJob).toBeCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        true,
      );
    });

    it('should set timer when execute failed and periodic = true ', () => {
      const info = {
        key: JOB_KEY.FETCH_ACCOUNT_INFO,
        isExecuting: false,
        isDropt: false,
        periodic: true,
        intervalSeconds: 60,
        retryTime: 0,
        jobId: 0,
        executeFunc: (callback: (successful: boolean) => void) => {
          callback(false);
        },
      } as any;
      jobScheduler['_setLastSuccessTime'] = jest.fn();
      jobScheduler['_setTimer'] = jest.fn().mockReturnValueOnce(455);
      jobScheduler['_execute'](info);
      expect(jobScheduler['_setLastSuccessTime']).toBeCalledTimes(0);
      expect(jobScheduler['_setTimer']).toBeCalledWith(info, 60000);
      expect(info.jobId).toEqual(455);
    });

    it('should retry when execute failed and periodic = false and retryTime > 0 ', () => {
      const info = {
        key: JOB_KEY.FETCH_ACCOUNT_INFO,
        isExecuting: false,
        isDropt: false,
        periodic: false,
        intervalSeconds: 60,
        retryTime: 1,
        jobId: 0,
        executeFunc: (callback: (successful: boolean) => void) => {
          callback(false);
        },
      } as any;
      jobScheduler['_setLastSuccessTime'] = jest.fn();
      jobScheduler['_setTimer'] = jest.fn().mockReturnValueOnce(455);
      jobScheduler['_execute'](info);
      expect(jobScheduler['_setLastSuccessTime']).toBeCalledTimes(0);
      expect(jobScheduler['_setTimer']).toBeCalledWith(info, 60000);
      expect(info.retryTime).toEqual(0);
      expect(info.jobId).toEqual(455);
    });

    it('should remove job when execute failed and periodic = false and retryTime = 0 ', () => {
      const info = {
        key: JOB_KEY.FETCH_ACCOUNT_INFO,
        isExecuting: false,
        isDropt: false,
        periodic: false,
        intervalSeconds: 60,
        retryTime: 0,
        jobId: 0,
        executeFunc: (callback: (successful: boolean) => void) => {
          callback(false);
        },
      } as any;
      jobScheduler['_setLastSuccessTime'] = jest.fn();
      jobScheduler['_setTimer'] = jest.fn().mockReturnValueOnce(455);
      jobScheduler.cancelJob = jest.fn();
      jobScheduler['_execute'](info);
      expect(jobScheduler['_setLastSuccessTime']).toBeCalledTimes(0);
      expect(jobScheduler['_setTimer']).toBeCalledTimes(0);
      expect(jobScheduler.cancelJob).toBeCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        true,
      );
      expect(info.retryTime).toEqual(0);
    });
  });
});
