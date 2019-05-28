/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoUserConfig, RCInfoGlobalConfig } from '../../config';
import { RCInfoFetchController } from '../RCInfoFetchController';
import { RCInfoApi } from '../../../../api/ringcentral';
import { jobScheduler, JOB_KEY } from '../../../../framework/utils/jobSchedule';
import notificationCenter from '../../../../service/notificationCenter';
import { RC_INFO } from '../../../../service/eventKey';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { AccountGlobalConfig } from '../../../account/config/AccountGlobalConfig';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import {
  EGetForwardingFlipNumberType,
  EForwardingFlipNumberType,
} from '../../types';
import { ForwardingNumberJsonData } from './ForwardingNumberJsonData';

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
      expect(rcInfoFetchController.scheduleRCInfoJob).toBeCalledTimes(0);
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
      expect(jobScheduler.scheduleDailyPeriodicJob).toBeCalled();
    });
  });

  describe('requestRCClientInfo()', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.requestRCClientInfo = jest.fn().mockReturnValue('rcClientInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCClientInfo();
      expect(RCInfoApi.requestRCClientInfo).toBeCalledTimes(1);
      expect(RCInfoUserConfig.prototype.setClientInfo).toBeCalledWith(
        'rcClientInfo',
      );
      expect(notificationCenter.emit).toBeCalledWith(
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
      expect(RCInfoApi.requestRCAccountInfo).toBeCalledTimes(1);
      expect(RCInfoUserConfig.prototype.setAccountInfo).toBeCalledWith(
        'rcAccountInfo',
      );
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.ACCOUNT_INFO,
        'rcAccountInfo',
      );
    });
  });

  describe('requestRCExtensionInfo()', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.requestRCExtensionInfo = jest
        .fn()
        .mockReturnValue('rcExtensionInfo');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCExtensionInfo();
      expect(RCInfoApi.requestRCExtensionInfo).toBeCalledTimes(1);
      expect(RCInfoUserConfig.prototype.setExtensionInfo).toBeCalledWith(
        'rcExtensionInfo',
      );
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.EXTENSION_INFO,
        'rcExtensionInfo',
      );
    });
  });

  describe('requestRCRolePermissions()', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.requestRCRolePermissions = jest
        .fn()
        .mockReturnValue('rcRolePermission');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestRCRolePermissions();
      expect(RCInfoApi.requestRCRolePermissions).toBeCalledTimes(1);
      expect(RCInfoUserConfig.prototype.setRolePermissions).toBeCalledWith(
        'rcRolePermission',
      );
      expect(notificationCenter.emit).toBeCalledWith(
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

      expect(RCInfoApi.getSpecialNumbers).toBeCalledWith({ countryId: 2 });
      expect(RCInfoUserConfig.prototype.setSpecialNumberRules).toBeCalledWith({
        2: 'specialNumbers',
      });
      expect(notificationCenter.emit).toBeCalledWith(
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
      expect(RCInfoApi.getPhoneParserData).toBeCalledTimes(1);
      expect(rcInfoFetchController.getPhoneDataVersion).toBeCalledTimes(1);
      expect(notificationCenter.emit).toBeCalledWith(
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
      expect(RCInfoApi.getDialingPlan).toBeCalledTimes(1);
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.DIALING_PLAN,
        'dialingPlan',
      );
      expect(RCInfoUserConfig.prototype.setDialingPlan).toBeCalledWith(
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
      expect(RCInfoApi.getAccountServiceInfo).toBeCalledTimes(1);
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.RC_SERVICE_INFO,
        'AccountServiceInfo',
      );
      expect(RCInfoUserConfig.prototype.setAccountServiceInfo).toBeCalledWith(
        'AccountServiceInfo',
      );
    });
  });

  describe('requestRCAccountRelativeInfo()', () => {
    it('should request rc info', async () => {
      rcInfoFetchController.requestRCClientInfo = jest.fn();
      rcInfoFetchController.requestRCAccountInfo = jest.fn();
      rcInfoFetchController.requestRCExtensionInfo = jest.fn();
      rcInfoFetchController.requestRCRolePermissions = jest.fn();
      await rcInfoFetchController.requestRCAccountRelativeInfo();
      expect(rcInfoFetchController.requestRCClientInfo).toBeCalled();
      expect(rcInfoFetchController.requestRCAccountInfo).toBeCalled();
      expect(rcInfoFetchController.requestRCExtensionInfo).toBeCalled();
      expect(rcInfoFetchController.requestRCRolePermissions).toBeCalled();
    });
  });

  describe('requestExtensionPhoneNumberList', () => {
    it('should send request and save to storage', async () => {
      RCInfoApi.getExtensionPhoneNumberList = jest
        .fn()
        .mockReturnValue('extensionPhoneNumberList');
      notificationCenter.emit.mockImplementationOnce(() => {});
      await rcInfoFetchController.requestExtensionPhoneNumberList();
      expect(RCInfoApi.getExtensionPhoneNumberList).toBeCalledWith({
        perPage: 1000,
      });
      expect(
        RCInfoUserConfig.prototype.setExtensionPhoneNumberList,
      ).toBeCalledWith('extensionPhoneNumberList');
      expect(notificationCenter.emit).toBeCalledWith(
        RC_INFO.EXTENSION_PHONE_NUMBER_LIST,
        'extensionPhoneNumberList',
      );
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
      ).toBeCalledWith('phoneData');
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

  describe('getDialingPlan', () => {
    it('should get value from config', async () => {
      // prettier-ignore
      rcInfoFetchController['rcInfoUserConfig'].getDialingPlan = jest.fn().mockReturnValue('test');
      expect(await rcInfoFetchController.getDialingPlan()).toEqual('test');
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
  describe('getForwardingFlipNumbers', () => {
    it('should return empty if there is not data', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getForwardingNumbers = jest.fn().mockResolvedValue(undefined);
      rcInfoFetchController[
        'requestForwardingNumbers'
      ] = jest.fn().mockResolvedValueOnce({});
      const result = await rcInfoFetchController.getForwardingFlipNumbers(
        EGetForwardingFlipNumberType.FLIP,
      );
      expect(result.length).toEqual(0);
    });
    it('should return correct forwarding numbers', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getForwardingNumbers = jest
        .fn()
        .mockResolvedValue(ForwardingNumberJsonData);
      rcInfoFetchController[
        'requestForwardingNumbers'
      ] = jest.fn().mockResolvedValueOnce({});
      const result = await rcInfoFetchController.getForwardingFlipNumbers(
        EGetForwardingFlipNumberType.FORWARDING,
      );
      expect(result.map(item => item.phoneNumber)).toEqual([
        '+16502095678',
        '+16502096235',
      ]);
      expect(result[1].type).toEqual(EForwardingFlipNumberType.WORK);
      expect(result[1].flipNumber).toEqual(3);
    });
    it('should return correct flip numbers', async () => {
      rcInfoFetchController[
        'rcInfoUserConfig'
      ].getForwardingNumbers = jest
        .fn()
        .mockResolvedValue(ForwardingNumberJsonData);
      rcInfoFetchController[
        'requestForwardingNumbers'
      ] = jest.fn().mockResolvedValueOnce({});
      const result = await rcInfoFetchController.getForwardingFlipNumbers(
        EGetForwardingFlipNumberType.FLIP,
      );
      expect(result.map(item => item.phoneNumber)).toEqual([
        '+16502095678',
        '+16502090011',
      ]);
      expect(result[1].type).toEqual(EForwardingFlipNumberType.HOME);
      expect(result[1].flipNumber).toEqual(2);
    });
  });
});
