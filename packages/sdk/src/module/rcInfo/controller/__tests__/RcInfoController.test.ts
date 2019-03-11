/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoUserConfig } from '../../config';
import { NewGlobalConfig } from '../../../../service/config/NewGlobalConfig';
import { RcInfoController } from '../RcInfoController';
import { RcInfoApi, TelephonyApi } from '../../../../api/ringcentral';
import { PhoneParserUtility } from '../../../../utils/phoneParser';
import AccountService from '../../../../service/account';
import { jobScheduler } from '../../../../framework/utils/jobSchedule';

jest.mock('../../config');

describe('RcInfoController', () => {
  let rcInfoController: RcInfoController;
  beforeEach(() => {
    jest.clearAllMocks();
    rcInfoController = new RcInfoController();
  });

  describe('requestRcInfo()', () => {
    const mockIsAccountReady = jest.fn();
    beforeAll(() => {
      AccountService.getInstance = jest.fn().mockReturnValue({
        isAccountReady: mockIsAccountReady,
      });
    });
    it('should not schedule rc info job when can not start schedule', () => {
      jobScheduler.scheduleDailyPeriodicJob = jest.fn();
      mockIsAccountReady.mockReturnValueOnce(false);
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValueOnce('RC');
      rcInfoController.requestRcInfo();
      expect(jobScheduler.scheduleDailyPeriodicJob).toBeCalledTimes(0);
      expect(rcInfoController['_isRcInfoJobScheduled']).toBeFalsy();
      mockIsAccountReady.mockReturnValueOnce(true);
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValueOnce('GLIP');
      rcInfoController.requestRcInfo();
      expect(jobScheduler.scheduleDailyPeriodicJob).toBeCalledTimes(0);
      expect(rcInfoController['_isRcInfoJobScheduled']).toBeFalsy();
    });

    it('should schedule all rc info job and should not schedule again', () => {
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValueOnce('RC');
      mockIsAccountReady.mockReturnValueOnce(true);
      jobScheduler.scheduleDailyPeriodicJob = jest.fn();
      rcInfoController.requestRcInfo();
      expect(rcInfoController['_isRcInfoJobScheduled']).toBeTruthy();
      rcInfoController.requestRcInfo();
      expect(jobScheduler.scheduleDailyPeriodicJob).toBeCalledTimes(5);
    });
  });

  describe('requestRcClientInfo()', () => {
    it('should send request and save to storage', async () => {
      const mockCallback = jest.fn();
      RcInfoApi.requestRcClientInfo = jest.fn().mockReturnValue('rcClientInfo');
      await rcInfoController.requestRcClientInfo(mockCallback);
      expect(RcInfoApi.requestRcClientInfo).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setClientInfo).toBeCalledWith(
        'rcClientInfo',
      );
      expect(mockCallback).toBeCalledWith(true);
    });
  });

  describe('requestRcAccountInfo()', () => {
    it('should send request and save to storage', async () => {
      const mockCallback = jest.fn();
      RcInfoApi.requestRcAccountInfo = jest
        .fn()
        .mockReturnValue('rcAccountInfo');
      await rcInfoController.requestRcAccountInfo(mockCallback);
      expect(RcInfoApi.requestRcAccountInfo).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setAccountInfo).toBeCalledWith(
        'rcAccountInfo',
      );
      expect(mockCallback).toBeCalledWith(true);
    });
  });

  describe('requestRcExtensionInfo()', () => {
    it('should send request and save to storage', async () => {
      const mockCallback = jest.fn();
      RcInfoApi.requestRcExtensionInfo = jest
        .fn()
        .mockReturnValue('rcExtensionInfo');
      await rcInfoController.requestRcExtensionInfo(mockCallback);
      expect(RcInfoApi.requestRcExtensionInfo).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setExtensionInfo).toBeCalledWith(
        'rcExtensionInfo',
      );
      expect(mockCallback).toBeCalledWith(true);
    });
  });

  describe('requestRcRolePermission()', () => {
    it('should send request and save to storage', async () => {
      const mockCallback = jest.fn();
      RcInfoApi.requestRcRolePermission = jest
        .fn()
        .mockReturnValue('rcRolePermission');
      await rcInfoController.requestRcRolePermission(mockCallback);
      expect(RcInfoApi.requestRcRolePermission).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setRolePermission).toBeCalledWith(
        'rcRolePermission',
      );
      expect(mockCallback).toBeCalledWith(true);
    });
  });

  describe('requestRcPhoneData()', () => {
    it('should send request and save to storage', async () => {
      const mockCallback = jest.fn();
      PhoneParserUtility.getPhoneDataFileVersion = jest.fn();
      PhoneParserUtility.initPhoneParser = jest.fn();
      TelephonyApi.getPhoneParserData = jest
        .fn()
        .mockReturnValue('rcPhoneData');
      NewGlobalConfig.setPhoneData = jest.fn();
      await rcInfoController.requestRcPhoneData(mockCallback);
      expect(TelephonyApi.getPhoneParserData).toBeCalledTimes(1);
      expect(NewGlobalConfig.setPhoneData).toBeCalledWith('rcPhoneData');
      expect(mockCallback).toBeCalledWith(true);
      expect(PhoneParserUtility.getPhoneDataFileVersion).toBeCalledTimes(1);
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(1);
    });
  });
});
