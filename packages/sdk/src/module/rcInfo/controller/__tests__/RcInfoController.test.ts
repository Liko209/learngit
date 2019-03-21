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
import { jobScheduler, JOB_KEY } from '../../../../framework/utils/jobSchedule';
import { ERcServiceFeaturePermission } from '../../types';
import { RolePermissionController } from '../RolePermissionController';
import { PermissionService } from '../../../permission';
import notificationCenter from '../../../../service/notificationCenter';
import { RC_INFO } from '../../../../service/eventKey';

jest.mock('../../config');
jest.mock('../../../permission');

describe('RcInfoController', () => {
  let rcInfoController: RcInfoController;
  jest.spyOn(notificationCenter, 'emit');
  function clearMocks() {
    jest.clearAllMocks();
  }

  beforeEach(() => {
    clearMocks();
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
      rcInfoController.scheduleRcInfoJob = jest.fn();
      mockIsAccountReady.mockReturnValueOnce(false);
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValueOnce('RC');
      rcInfoController.requestRcInfo();
      expect(rcInfoController.scheduleRcInfoJob).toBeCalledTimes(0);
      expect(rcInfoController['_isRcInfoJobScheduled']).toBeFalsy();
      mockIsAccountReady.mockReturnValueOnce(true);
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValueOnce('GLIP');
      rcInfoController.requestRcInfo();
      expect(rcInfoController.scheduleRcInfoJob).toBeCalledTimes(0);
      expect(rcInfoController['_isRcInfoJobScheduled']).toBeFalsy();
    });

    it('should schedule all rc info job and should not schedule again', () => {
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValueOnce('RC');
      mockIsAccountReady.mockReturnValueOnce(true);
      rcInfoController.scheduleRcInfoJob = jest.fn();
      rcInfoController.requestRcInfo();
      expect(rcInfoController['_isRcInfoJobScheduled']).toBeTruthy();
      rcInfoController.requestRcInfo();
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_CLIENT_INFO,
        rcInfoController.requestRcClientInfo,
        false,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        rcInfoController.requestRcAccountInfo,
        false,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_EXTENSION_INFO,
        rcInfoController.requestRcExtensionInfo,
        false,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ROLE_PERMISSION,
        rcInfoController.requestRcRolePermission,
        false,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_PHONE_DATA,
        rcInfoController.requestRcPhoneData,
        false,
      );
    });

    it('should schedule all rc info job and should ignore first time when _shouldIgnoreFirstTime = true', () => {
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValueOnce('RC');
      mockIsAccountReady.mockReturnValueOnce(true);
      rcInfoController.scheduleRcInfoJob = jest.fn();
      rcInfoController['_shouldIgnoreFirstTime'] = true;
      rcInfoController.requestRcInfo();
      expect(rcInfoController['_isRcInfoJobScheduled']).toBeTruthy();
      rcInfoController.requestRcInfo();
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_CLIENT_INFO,
        rcInfoController.requestRcClientInfo,
        true,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        rcInfoController.requestRcAccountInfo,
        true,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_EXTENSION_INFO,
        rcInfoController.requestRcExtensionInfo,
        true,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ROLE_PERMISSION,
        rcInfoController.requestRcRolePermission,
        true,
      );
      expect(rcInfoController.scheduleRcInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_PHONE_DATA,
        rcInfoController.requestRcPhoneData,
        false,
      );
    });
  });

  describe('scheduleRcInfoJob()', () => {
    it('should call jobScheduler', () => {
      jest
        .spyOn(jobScheduler, 'scheduleDailyPeriodicJob')
        .mockImplementationOnce(() => {});
      rcInfoController.scheduleRcInfoJob(
        JOB_KEY.FETCH_CLIENT_INFO,
        () => {},
        false,
      );
      expect(jobScheduler.scheduleDailyPeriodicJob).toBeCalled();
    });
  });

  describe('requestRcClientInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcClientInfo = jest.fn().mockReturnValue('rcClientInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoController.requestRcClientInfo();
      expect(RcInfoApi.requestRcClientInfo).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setClientInfo).toBeCalledWith(
        'rcClientInfo',
      );
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.CLIENT_INFO,
        'rcClientInfo',
      );
    });
  });

  describe('requestRcAccountInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcAccountInfo = jest
        .fn()
        .mockReturnValue('rcAccountInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoController.requestRcAccountInfo();
      expect(RcInfoApi.requestRcAccountInfo).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setAccountInfo).toBeCalledWith(
        'rcAccountInfo',
      );
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.ACCOUNT_INFO,
        'rcAccountInfo',
      );
    });
  });

  describe('requestRcExtensionInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcExtensionInfo = jest
        .fn()
        .mockReturnValue('rcExtensionInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoController.requestRcExtensionInfo();
      expect(RcInfoApi.requestRcExtensionInfo).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setExtensionInfo).toBeCalledWith(
        'rcExtensionInfo',
      );
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.EXTENSION_INFO,
        'rcExtensionInfo',
      );
    });
  });

  describe('requestRcRolePermission()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcRolePermission = jest
        .fn()
        .mockReturnValue('rcRolePermission');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoController.requestRcRolePermission();
      expect(RcInfoApi.requestRcRolePermission).toBeCalledTimes(1);
      expect(RcInfoUserConfig.prototype.setRolePermission).toBeCalledWith(
        'rcRolePermission',
      );
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.ROLE_PERMISSION,
        'rcRolePermission',
      );
    });
  });

  describe('requestRcPhoneData()', () => {
    it('should send request and save to storage', async () => {
      PhoneParserUtility.getPhoneDataFileVersion = jest.fn();
      PhoneParserUtility.initPhoneParser = jest.fn();
      TelephonyApi.getPhoneParserData = jest
        .fn()
        .mockReturnValue('rcPhoneData');
      notificationCenter.emit.mockImplementationOnce(() => {});
      NewGlobalConfig.setPhoneData = jest.fn();
      await rcInfoController.requestRcPhoneData();
      expect(TelephonyApi.getPhoneParserData).toBeCalledTimes(1);
      expect(NewGlobalConfig.setPhoneData).toBeCalledWith('rcPhoneData');
      expect(PhoneParserUtility.getPhoneDataFileVersion).toBeCalledTimes(1);
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(1);
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.PHONE_DATA,
        'rcPhoneData',
      );
    });
  });

  describe('requestRcAccountRelativeInfo()', () => {
    it('should request rc info', async () => {
      rcInfoController.requestRcClientInfo = jest.fn();
      rcInfoController.requestRcAccountInfo = jest.fn();
      rcInfoController.requestRcExtensionInfo = jest.fn();
      rcInfoController.requestRcRolePermission = jest.fn();
      await rcInfoController.requestRcAccountRelativeInfo();
      expect(rcInfoController.requestRcClientInfo).toBeCalledWith(false);
      expect(rcInfoController.requestRcAccountInfo).toBeCalledWith(false);
      expect(rcInfoController.requestRcExtensionInfo).toBeCalledWith(false);
      expect(rcInfoController.requestRcRolePermission).toBeCalledWith(false);
    });
  });

  describe('isRcFeaturePermissionEnabled', () => {
    beforeEach(() => {
      clearMocks();
      PermissionService.getInstance = jest.fn().mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
      });
    });
    it('should return true when users have calling permission', () => {
      const extensionInfo = {
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: true },
        ],
      };
      const rcInfoUserConfig = {
        getExtensionInfo: jest.fn().mockReturnValue(extensionInfo),
      };
      Object.assign(rcInfoController, {
        _rcInfoUserConfig: rcInfoUserConfig,
      });

      const res = rcInfoController.isRcFeaturePermissionEnabled(
        ERcServiceFeaturePermission.VOIP_CALLING,
      );
      expect(res).toBe(true);
    });

    it('should return false when users dont have calling permission', () => {
      const extensionInfo = {
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: false },
        ],
      };
      const rcInfoUserConfig = {
        getExtensionInfo: jest.fn().mockReturnValue(extensionInfo),
      };
      Object.assign(rcInfoController, {
        _rcInfoUserConfig: rcInfoUserConfig,
      });

      const res = rcInfoController.isRcFeaturePermissionEnabled(
        ERcServiceFeaturePermission.VOIP_CALLING,
      );
      expect(res).toBe(false);
    });

    it('should return true when users have permission', () => {
      const extensionInfo = {
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: false },
        ],
      };
      const rolePermissionInfo = {
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'ReadCompanyCallLog' } },
        ],
      };
      const rcInfoUserConfig = {
        getExtensionInfo: jest.fn().mockReturnValue(extensionInfo),
        getRolePermission: jest.fn().mockReturnValue(rolePermissionInfo),
      };

      const rolePermissionController = new RolePermissionController();
      Object.assign(rolePermissionController, {
        _rcInfoUserConfig: rcInfoUserConfig,
      });

      Object.assign(rcInfoController, {
        _rcInfoUserConfig: rcInfoUserConfig,
        _rolePermissionController: rolePermissionController,
      });
      const res = rcInfoController.isRcFeaturePermissionEnabled(
        ERcServiceFeaturePermission.READ_COMPANY_CALLLOG,
      );
      expect(res).toBe(true);
    });

    it('should return false when users dont have permission', () => {
      const extensionInfo = {
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: false },
        ],
      };
      const rolePermissionInfo = {
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'DND' } },
        ],
      };
      const rcInfoUserConfig = {
        getExtensionInfo: jest.fn().mockReturnValue(extensionInfo),
        getRolePermission: jest.fn().mockReturnValue(rolePermissionInfo),
      };

      const rolePermissionController = new RolePermissionController();
      Object.assign(rolePermissionController, {
        _rcInfoUserConfig: rcInfoUserConfig,
      });

      Object.assign(rcInfoController, {
        _rcInfoUserConfig: rcInfoUserConfig,
        _rolePermissionController: rolePermissionController,
      });
      const res = rcInfoController.isRcFeaturePermissionEnabled(
        ERcServiceFeaturePermission.READ_COMPANY_CALLLOG,
      );
      expect(res).toBe(false);
    });

    it('should return true when users have pager send permission', () => {
      const extensionInfo = {
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'Pager', enabled: true },
        ],
      };
      const rolePermissionInfo = {
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'InternalSMS' } },
        ],
      };
      const rcInfoUserConfig = {
        getExtensionInfo: jest.fn().mockReturnValue(extensionInfo),
        getRolePermission: jest.fn().mockReturnValue(rolePermissionInfo),
      };

      const rolePermissionController = new RolePermissionController();
      Object.assign(rolePermissionController, {
        _rcInfoUserConfig: rcInfoUserConfig,
      });

      Object.assign(rcInfoController, {
        _rcInfoUserConfig: rcInfoUserConfig,
        _rolePermissionController: rolePermissionController,
      });
      const res = rcInfoController.isRcFeaturePermissionEnabled(
        ERcServiceFeaturePermission.PAGER_SEND,
      );
      expect(res).toBe(true);
    });

    it('should return false when users dont have fax permission', () => {
      const extensionInfo = {
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'Fax', enabled: false },
        ],
      };
      const rolePermissionInfo = {
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'InternalSMS' } },
        ],
      };
      const rcInfoUserConfig = {
        getExtensionInfo: jest.fn().mockReturnValue(extensionInfo),
        getRolePermission: jest.fn().mockReturnValue(rolePermissionInfo),
      };

      const rolePermissionController = new RolePermissionController();
      Object.assign(rolePermissionController, {
        _rcInfoUserConfig: rcInfoUserConfig,
      });

      Object.assign(rcInfoController, {
        _rcInfoUserConfig: rcInfoUserConfig,
        _rolePermissionController: rolePermissionController,
      });
      const res = rcInfoController.isRcFeaturePermissionEnabled(
        ERcServiceFeaturePermission.FAX,
      );
      expect(res).toBe(false);
    });
  });
});
