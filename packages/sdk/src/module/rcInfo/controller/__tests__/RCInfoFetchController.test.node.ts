/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoUserConfig, RCInfoGlobalConfig } from '../../config';
import { RCInfoFetchController } from '../RCInfoFetchController';
import {
  RCInfoApi,
  RCExtensionInfo,
  BLOCK_STATUS,
  IStateRequest,
  ICountryRequest,
} from 'sdk/api/ringcentral';
import { jobScheduler, JOB_KEY } from 'sdk/framework/utils/jobSchedule';
import notificationCenter from 'sdk/service/notificationCenter';
import { RC_INFO } from 'sdk/service/eventKey';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { AccountGlobalConfig } from '../../../account/config/AccountGlobalConfig';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { RCAccount } from 'sdk/account';

jest.mock('../../../account/config/AccountGlobalConfig');
jest.mock('../../../permission');
jest.mock('../../../account/config/AccountUserConfig');
jest.mock('../../config');

describe('RCInfoFetchController', () => {
  let rcInfoFetchController: RCInfoFetchController;
  jest.spyOn(notificationCenter, 'emit');
  function clearMocks() {
    jest.clearAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValue(1);
    rcInfoFetchController = new RCInfoFetchController();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: AccountUserConfig.prototype };
        }
        if (config === ServiceConfig.RC_INFO_SERVICE) {
          return { DBConfig: RCInfoUserConfig.prototype };
        }
        return;
      });
  });

  describe('requestRCInfo()', () => {
    beforeAll(() => {});
    it('should not schedule rc info job when can not start schedule', () => {
      rcInfoFetchController.scheduleRCInfoJob = jest.fn();
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValueOnce('GLIP');
      rcInfoFetchController.requestRCInfo();
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledTimes(0);
      expect(rcInfoFetchController['_isRCInfoJobScheduled']).toBeFalsy();
    });

    it('should schedule all rc info job and should not schedule again', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValue('RC');
      rcInfoFetchController.scheduleRCInfoJob = jest.fn();
      rcInfoFetchController.requestRCInfo();
      expect(rcInfoFetchController['_isRCInfoJobScheduled']).toBeTruthy();
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_CLIENT_INFO,
        rcInfoFetchController.requestRCClientInfo,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        rcInfoFetchController.requestRCAccountInfo,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_EXTENSION_INFO,
        rcInfoFetchController.requestRCExtensionInfo,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ROLE_PERMISSIONS,
        rcInfoFetchController.requestRCRolePermissions,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_PHONE_DATA,
        rcInfoFetchController.requestRCPhoneData,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_SPECIAL_NUMBER_RULE,
        rcInfoFetchController.requestSpecialNumberRule,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_BLOCK_NUMBER,
        rcInfoFetchController.requestBlockNumberList,
        false,
      );
    });

    it('should schedule all rc info job and should ignore first time when _shouldIgnoreFirstTime = true', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValueOnce('RC');
      rcInfoFetchController.scheduleRCInfoJob = jest.fn();
      rcInfoFetchController['_shouldIgnoreFirstTime'] = true;
      rcInfoFetchController.requestRCInfo();
      expect(rcInfoFetchController['_isRCInfoJobScheduled']).toBeTruthy();
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_CLIENT_INFO,
        rcInfoFetchController.requestRCClientInfo,
        true,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        rcInfoFetchController.requestRCAccountInfo,
        true,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_EXTENSION_INFO,
        rcInfoFetchController.requestRCExtensionInfo,
        true,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_ROLE_PERMISSIONS,
        rcInfoFetchController.requestRCRolePermissions,
        true,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_PHONE_DATA,
        rcInfoFetchController.requestRCPhoneData,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_SPECIAL_NUMBER_RULE,
        rcInfoFetchController.requestSpecialNumberRule,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_DIALING_PLAN,
        rcInfoFetchController.requestDialingPlan,
        false,
      );
      expect(rcInfoFetchController.scheduleRCInfoJob).toHaveBeenCalledWith(
        JOB_KEY.FETCH_RC_ACCOUNT_SERVICE_INFO,
        rcInfoFetchController.requestAccountServiceInfo,
        false,
      );
    });
  });

  describe('scheduleRCInfoJob()', () => {
    it('should call jobScheduler', () => {
      jest
        .spyOn(jobScheduler, 'scheduleDailyPeriodicJob')
        .mockImplementationOnce(() => {});
      rcInfoFetchController.scheduleRCInfoJob(
        JOB_KEY.FETCH_CLIENT_INFO,
        () => {},
        false,
      );
      expect(jobScheduler.scheduleDailyPeriodicJob).toHaveBeenCalled();
    });
  });

  describe('requestRCClientInfo()', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.requestRCClientInfo = jest.fn().mockReturnValue('rcClientInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCClientInfo();
      expect(RCInfoApi.requestRCClientInfo).toHaveBeenCalledTimes(1);
      expect(RCInfoUserConfig.prototype.setClientInfo).toHaveBeenCalledWith(
        'rcClientInfo',
      );
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.CLIENT_INFO,
        'rcClientInfo',
      );
    });
  });

  describe('requestRCAccountInfo()', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.requestRCAccountInfo = jest
        .fn()
        .mockReturnValue('rcAccountInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCAccountInfo();
      expect(RCInfoApi.requestRCAccountInfo).toHaveBeenCalledTimes(1);
      expect(RCInfoUserConfig.prototype.setAccountInfo).toHaveBeenCalledWith(
        'rcAccountInfo',
      );
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.ACCOUNT_INFO,
        'rcAccountInfo',
      );
    });
  });

  describe('requestCountryState', () => {
    it('should call api to get state', async () => {
      RCInfoApi.getCountryState = jest.fn().mockReturnValue({ records: [] });
      const request: IStateRequest = { countryId: '1', perPage: 400, page: 1 };
      await rcInfoFetchController.requestCountryState(request);
      expect(RCInfoApi.getCountryState).toHaveBeenCalledWith(request);
    });
  });

  describe('requestRCExtensionInfo()', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.requestRCExtensionInfo = jest
        .fn()
        .mockReturnValue('rcExtensionInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCExtensionInfo();
      expect(RCInfoApi.requestRCExtensionInfo).toHaveBeenCalledTimes(1);
      expect(RCInfoUserConfig.prototype.setExtensionInfo).toHaveBeenCalledWith(
        'rcExtensionInfo',
      );
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.EXTENSION_INFO,
        'rcExtensionInfo',
      );
    });
  });

  describe('getRCExtensionId()', () => {
    it('should return extension info id', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getExtensionInfo = jest
        .fn()
        .mockReturnValue({ id: 108, name: 'test' } as RCExtensionInfo);
      const result = await rcInfoFetchController.getRCExtensionId();
      expect(result).toEqual(108);
    });
  });

  describe('getUserEmail()', () => {
    it('should return email', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getExtensionInfo = jest
      .fn()
      .mockReturnValue({contact: {email: "a@ringcentral.com"}} as RCExtensionInfo);
      const result  = await rcInfoFetchController.getUserEmail();
      expect(result).toEqual("a@ringcentral.com");
    });
  });

  describe('requestRCRolePermissions()', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.requestRCRolePermissions = jest
        .fn()
        .mockReturnValue('rcRolePermission');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCRolePermissions();
      expect(RCInfoApi.requestRCRolePermissions).toHaveBeenCalledTimes(1);
      expect(
        RCInfoUserConfig.prototype.setRolePermissions,
      ).toHaveBeenCalledWith('rcRolePermission');
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.ROLE_PERMISSIONS,
        'rcRolePermission',
      );
    });
  });

  describe('requestSpecialNumberRule()', () => {
    beforeEach(() => {
      clearMocks();
      AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(1);
    });

    it('should send request and save to storage', async () => {
      RCInfoGlobalConfig.getStationLocation = jest
        .fn()
        .mockReturnValue({ 1: { countryInfo: { id: '2' } } });
      RCInfoApi.getSpecialNumbers = jest.fn().mockReturnValue('specialNumbers');
      notificationCenter.emit = jest.fn().mockImplementationOnce(() => {});
      await rcInfoFetchController.requestSpecialNumberRule();

      expect(RCInfoApi.getSpecialNumbers).toHaveBeenCalledWith({
        countryId: 2,
      });
      expect(
        RCInfoUserConfig.prototype.setSpecialNumberRules,
      ).toHaveBeenCalledWith({
        2: 'specialNumbers',
      });
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.SPECIAL_NUMBER_RULE,
        { 2: 'specialNumbers' },
      );
    });
  });

  describe('requestRCPhoneData()', () => {
    it('should send request and save to storage', async () => {
      rcInfoFetchController.getPhoneDataVersion = jest.fn();
      RCInfoApi.getPhoneParserData = jest.fn().mockReturnValue('rcPhoneData');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCPhoneData();
      expect(RCInfoApi.getPhoneParserData).toHaveBeenCalledTimes(1);
      expect(rcInfoFetchController.getPhoneDataVersion).toHaveBeenCalledTimes(
        1,
      );
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.PHONE_DATA,
        'rcPhoneData',
      );
    });
  });

  describe('requestDialingPlan', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.getDialingPlan = jest.fn().mockResolvedValue('dialingPlan');
      notificationCenter.emit = jest.fn().mockImplementationOnce(() => {});
      await rcInfoFetchController.requestDialingPlan();
      expect(RCInfoApi.getDialingPlan).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.DIALING_PLAN,
        'dialingPlan',
      );
      expect(RCInfoUserConfig.prototype.setDialingPlan).toHaveBeenCalledWith(
        'dialingPlan',
      );
    });
  });

  describe('requestAccountServiceInfo', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.getAccountServiceInfo = jest
        .fn()
        .mockResolvedValue('AccountServiceInfo');
      notificationCenter.emit = jest.fn().mockImplementationOnce(() => {});
      await rcInfoFetchController.requestAccountServiceInfo();
      expect(RCInfoApi.getAccountServiceInfo).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.RC_SERVICE_INFO,
        'AccountServiceInfo',
      );
      expect(
        RCInfoUserConfig.prototype.setAccountServiceInfo,
      ).toHaveBeenCalledWith('AccountServiceInfo');
    });
  });

  describe('requestCountryList', () => {
    it('should send request to get country info', async () => {
      RCInfoApi.getCountryInfo = jest.fn().mockReturnValue({ records: [] });
      const spy = jest.spyOn(
        rcInfoFetchController,
        '_requestCountryListByPage',
      );
      const request: ICountryRequest = { page: 1, perPage: 500 };
      await rcInfoFetchController.requestCountryList(request);
      expect(RCInfoApi.getCountryInfo).toHaveBeenCalledWith(request);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('requestRCAccountRelativeInfo()', () => {
    it('should request rc info', async () => {
      rcInfoFetchController.requestRCClientInfo = jest.fn();
      rcInfoFetchController.requestRCAccountInfo = jest.fn();
      rcInfoFetchController.requestRCExtensionInfo = jest.fn();
      rcInfoFetchController.requestRCRolePermissions = jest.fn();
      await rcInfoFetchController.requestRCAccountRelativeInfo();
      expect(rcInfoFetchController.requestRCClientInfo).toHaveBeenCalled();
      expect(rcInfoFetchController.requestRCAccountInfo).toHaveBeenCalled();
      expect(rcInfoFetchController.requestRCExtensionInfo).toHaveBeenCalled();
      expect(rcInfoFetchController.requestRCRolePermissions).toHaveBeenCalled();
    });
  });

  describe('requestExtensionPhoneNumberList', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.getExtensionPhoneNumberList = jest
        .fn()
        .mockReturnValue('extensionPhoneNumberList');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestExtensionPhoneNumberList();
      expect(RCInfoApi.getExtensionPhoneNumberList).toHaveBeenCalledWith({
        perPage: 1000,
      });
      expect(
        RCInfoUserConfig.prototype.setExtensionPhoneNumberList,
      ).toHaveBeenCalledWith('extensionPhoneNumberList');
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.EXTENSION_PHONE_NUMBER_LIST,
        'extensionPhoneNumberList',
      );
    });
  });

  describe('requestExtensionCallerId', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.getExtensionCallerId = jest
        .fn()
        .mockReturnValue('extensionCallerId');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestExtensionCallerId();
      expect(RCInfoApi.getExtensionCallerId).toHaveBeenCalled();
      expect(
        RCInfoUserConfig.prototype.setExtensionCallerId,
      ).toHaveBeenCalledWith('extensionCallerId');
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        RC_INFO.EXTENSION_CALLER_ID,
        'extensionCallerId',
      );
    });
  });
  describe('requestBlockNumberList', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.getBlockNumberList = jest
        .fn()
        .mockResolvedValueOnce({
          records: [
            { id: 1, status: BLOCK_STATUS.BLOCKED },
            { id: 2, status: BLOCK_STATUS.BLOCKED },
          ],
          paging: { page: 1, totalPages: 2 },
        })
        .mockResolvedValueOnce({
          records: [{ id: 3, status: BLOCK_STATUS.BLOCKED }, { id: 4 }],
          paging: { page: 2, totalPages: 2 },
        });
      await rcInfoFetchController.requestBlockNumberList();
      expect(RCInfoApi.getBlockNumberList).toHaveBeenCalledTimes(2);
      expect(RCInfoApi.getBlockNumberList).toHaveBeenCalledWith({
        page: 2,
        perPage: 1000,
        status: BLOCK_STATUS.BLOCKED,
      });
      expect(RCInfoUserConfig.prototype.setBlockNumbers).toHaveBeenCalledWith([
        { id: 1, status: BLOCK_STATUS.BLOCKED },
        { id: 2, status: BLOCK_STATUS.BLOCKED },
        { id: 3, status: BLOCK_STATUS.BLOCKED },
      ]);
    });
  });

  describe('getRCClientInfo()', () => {
    it('should get value from config when value is invalid', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getClientInfo = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getRCClientInfo()).toEqual('test');
    });
  });

  describe('getRCAccountInfo()', () => {
    it('should get value from config when value is invalid', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getAccountInfo = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getRCAccountInfo()).toEqual('test');
    });
  });

  describe('getRCExtensionInfo()', () => {
    it('should get value from config when value is invalid', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getExtensionInfo = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getRCExtensionInfo()).toEqual('test');
    });
  });

  describe('getRCRolePermissions()', () => {
    it('should get value from config when value is invalid', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getRolePermissions = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getRCRolePermissions()).toEqual(
        'test',
      );
    });
  });

  describe('getSpecialNumberRule()', () => {
    beforeEach(() => {
      clearMocks();
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValue(1);
    });
    it('should get value from config when value is valid', async () => {
      RCInfoGlobalConfig.getStationLocation = jest
        .fn()
        .mockReturnValue({ 1: { countryInfo: { id: '2' } } });
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getSpecialNumberRules = jest.fn().mockReturnValue({ 2: {
        records: [],
        uri: '2',
        paging: {},
        navigation: {},
      }, 1: '1' });
      expect(await rcInfoFetchController.getSpecialNumberRule()).toEqual({
        records: [],
        uri: '2',
        paging: {},
        navigation: {},
      });
    });

    it('should just get value when db object type is ISpecialServiceNumber', async () => {
      RCInfoGlobalConfig.getStationLocation = jest
        .fn()
        .mockReturnValue({ 1: { countryInfo: { id: '2' } } });
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getSpecialNumberRules = jest.fn().mockReturnValue({ records: [],
        uri: '2',
        paging: {},
        navigation: {} });
      expect(await rcInfoFetchController.getSpecialNumberRule()).toEqual({
        navigation: {},
        paging: {},
        records: [],
        uri: '2',
      });
    });
  });

  describe('getSpecialNumberRuleByCountryId', () => {
    it('should get value from config when value is valid', async () => {
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getSpecialNumberRules = jest.fn().mockReturnValue({ 2: 'test', 1: '1' });
      expect(
        await rcInfoFetchController.getSpecialNumberRuleByCountryId(1),
      ).toEqual('1');
    });

    it('should get value form old data format', async () => {
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getSpecialNumberRules = jest.fn().mockReturnValue({  navigation: {},
        paging: {},
        records: [],
        uri: '2' });
      expect(
        await rcInfoFetchController.getSpecialNumberRuleByCountryId(1),
      ).toEqual({ navigation: {}, paging: {}, records: [], uri: '2' });
    });

    it('should return undefined when old is data format and can not find the country', async () => {
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getSpecialNumberRules = jest.fn().mockReturnValue({  navigation: {},
        paging: {},
        records: [],
        uri: '2' });
      expect(
        await rcInfoFetchController.getSpecialNumberRuleByCountryId(2),
      ).toEqual(undefined);
    });
  });

  describe('getPhoneData()', () => {
    it('should get value from config when value is invalid', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getPhoneData = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getPhoneData()).toEqual('test');
    });
  });

  describe('setPhoneData()', () => {
    it('should call config to set data', async () => {
      rcInfoFetchController['rcInfoUserConfig'].setPhoneData = jest.fn();
      await rcInfoFetchController.setPhoneData('phoneData');
      expect(
        rcInfoFetchController['rcInfoUserConfig'].setPhoneData,
      ).toHaveBeenCalledWith('phoneData');
    });
  });

  describe('getExtensionPhoneNumberList()', () => {
    it('should get value from config when value is invalid', async () => {
      rcInfoFetchController.rcInfoUserConfig.getExtensionPhoneNumberList = jest
        .fn()
        .mockResolvedValue('test');
      expect(await rcInfoFetchController.getExtensionPhoneNumberList()).toEqual(
        'test',
      );
    });
  });

  describe('getExtensionCallerId()', () => {
    it('should get value from config when value is invalid', async () => {
      rcInfoFetchController.rcInfoUserConfig.getExtensionCallerId = jest
        .fn()
        .mockResolvedValue('test');
      expect(await rcInfoFetchController.getExtensionCallerId()).toEqual(
        'test',
      );
    });
  });

  describe('setPhoneData()', () => {
    it('should call config to set data', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].setExtensionCallerId = jest.fn();
      await rcInfoFetchController.setExtensionCallerId('test');
      expect(
        rcInfoFetchController['rcInfoUserConfig'].setExtensionCallerId,
      ).toHaveBeenCalledWith('test');
    });
  });

  describe('getDialingPlan', () => {
    it('should get value from config', async () => {
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getDialingPlan = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getDialingPlan()).toEqual('test');
    });
  });

  describe('getDigitalLines', () => {
    it('should get value from config', async () => {
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getDeviceInfo = jest.fn().mockReturnValue({records: 'test'});
      const res = await rcInfoFetchController.getDigitalLines();
      expect(res).toBe('test');
    });
  });

  describe('getAccountServiceInfo', () => {
    it('should get value from config', async () => {
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getAccountServiceInfo = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getAccountServiceInfo()).toEqual(
        'test',
      );
    });
  });
});
