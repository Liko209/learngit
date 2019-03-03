/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoConfig } from '../../config';
import { NewGlobalConfig } from '../../../../service/config/NewGlobalConfig';
import { RcInfoController } from '../RcInfoController';
import { RcInfoApi, TelephonyApi } from '../../../../api/ringcentral';
import { PhoneParserUtility } from '../../../../utils/phoneParser';

jest.mock('../../config');

describe('RcInfoController', () => {
  let rcInfoController: RcInfoController;
  beforeEach(() => {
    jest.clearAllMocks();
    rcInfoController = new RcInfoController();
  });

  describe('requestRcInfo()', () => {
    it('should call correct function', () => {
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValue('RC');
      rcInfoController.requestRcClientInfo = jest.fn();
      rcInfoController.requestRcAccountInfo = jest.fn();
      rcInfoController.requestRcExtensionInfo = jest.fn();
      rcInfoController.requestRcRolePermission = jest.fn();
      rcInfoController.requestRcInfo();
      expect(rcInfoController.requestRcClientInfo).toBeCalledTimes(1);
      expect(rcInfoController.requestRcAccountInfo).toBeCalledTimes(1);
      expect(rcInfoController.requestRcExtensionInfo).toBeCalledTimes(1);
      expect(rcInfoController.requestRcRolePermission).toBeCalledTimes(1);
    });

    it('should call correct function', () => {
      NewGlobalConfig.getAccountType = jest.fn().mockReturnValue('GLIP');
      rcInfoController.requestRcClientInfo = jest.fn();
      rcInfoController.requestRcAccountInfo = jest.fn();
      rcInfoController.requestRcExtensionInfo = jest.fn();
      rcInfoController.requestRcRolePermission = jest.fn();
      rcInfoController.requestRcInfo();
      expect(rcInfoController.requestRcClientInfo).toBeCalledTimes(0);
      expect(rcInfoController.requestRcAccountInfo).toBeCalledTimes(0);
      expect(rcInfoController.requestRcExtensionInfo).toBeCalledTimes(0);
      expect(rcInfoController.requestRcRolePermission).toBeCalledTimes(0);
    });
  });

  describe('requestRcClientInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcClientInfo = jest.fn().mockReturnValue('rcClientInfo');
      await rcInfoController.requestRcClientInfo();
      expect(RcInfoApi.requestRcClientInfo).toBeCalledTimes(1);
      expect(RcInfoConfig.setRcClientInfo).toBeCalledWith('rcClientInfo');
    });
  });

  describe('requestRcAccountInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcAccountInfo = jest
        .fn()
        .mockReturnValue('rcAccountInfo');
      await rcInfoController.requestRcAccountInfo();
      expect(RcInfoApi.requestRcAccountInfo).toBeCalledTimes(1);
      expect(RcInfoConfig.setRcAccountInfo).toBeCalledWith('rcAccountInfo');
    });
  });

  describe('requestRcExtensionInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcExtensionInfo = jest
        .fn()
        .mockReturnValue('rcExtensionInfo');
      await rcInfoController.requestRcExtensionInfo();
      expect(RcInfoApi.requestRcExtensionInfo).toBeCalledTimes(1);
      expect(RcInfoConfig.setRcExtensionInfo).toBeCalledWith('rcExtensionInfo');
    });
  });

  describe('requestRcRolePermission()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcRolePermission = jest
        .fn()
        .mockReturnValue('rcRolePermission');
      await rcInfoController.requestRcRolePermission();
      expect(RcInfoApi.requestRcRolePermission).toBeCalledTimes(1);
      expect(RcInfoConfig.setRcRolePermissions).toBeCalledWith(
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
      await rcInfoController.requestRcPhoneData();
      expect(TelephonyApi.getPhoneParserData).toBeCalledTimes(1);
      expect(RcInfoConfig.setRcPhoneData).toBeCalledWith('rcPhoneData');
      expect(PhoneParserUtility.getPhoneDataFileVersion).toBeCalledTimes(1);
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(1);
    });
  });
});
