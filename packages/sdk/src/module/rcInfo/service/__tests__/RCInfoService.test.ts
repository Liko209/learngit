/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 18:12:05
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoService } from '../RCInfoService';
import { RCInfoController } from '../../controller/RCInfoController';
import { AccountUserConfig } from '../../../../module/account/config';
import { ACCOUNT_TYPE_ENUM } from '../../../../authenticator/constants';

jest.mock('../../controller/RCInfoFetchController');
jest.mock('../../controller/RCCallerIdController');
jest.mock('../../controller/RCPermissionController');
jest.mock('../../controller/RegionInfoController');
jest.mock('../../../../module/account/config');
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCInfoService', () => {
  let rcInfoService: RCInfoService;
  let rcInfoController: RCInfoController;
  let userConfig: AccountUserConfig;

  beforeEach(() => {
    clearMocks();
    rcInfoService = new RCInfoService();
    rcInfoController = new RCInfoController();
    Object.assign(rcInfoService, {
      _rcInfoController: rcInfoController,
    });
  });
  describe('getRCClientInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCClientInfo();
      expect(
        rcInfoController.getRCInfoFetchController().getRCClientInfo,
      ).toBeCalled();
    });
  });

  describe('requestRCInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.requestRCInfo();
      expect(
        rcInfoController.getRCInfoFetchController().requestRCInfo,
      ).toBeCalled();
    });
  });

  describe('requestRCAccountRelativeInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.requestRCAccountRelativeInfo();
      expect(
        rcInfoController.getRCInfoFetchController()
          .requestRCAccountRelativeInfo,
      ).toBeCalled();
    });
  });

  describe('getRCAccountInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCAccountInfo();
      expect(
        rcInfoController.getRCInfoFetchController().getRCAccountInfo,
      ).toBeCalled();
    });
  });
  describe('getRCExtensionInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCExtensionInfo();
      expect(
        rcInfoController.getRCInfoFetchController().getRCExtensionInfo,
      ).toBeCalled();
    });
  });

  describe('getRCRolePermissions()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCRolePermissions();
      expect(
        rcInfoController.getRCInfoFetchController().getRCRolePermissions,
      ).toBeCalled();
    });
  });

  describe('getSpecialNumberRule()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getSpecialNumberRule();
      expect(
        rcInfoController.getRCInfoFetchController().getSpecialNumberRule,
      ).toBeCalled();
    });
  });
  describe('getPhoneData()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getPhoneData();
      expect(
        rcInfoController.getRCInfoFetchController().getPhoneData,
      ).toBeCalled();
    });
  });

  describe('setPhoneData()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setPhoneData('1');
      expect(
        rcInfoController.getRCInfoFetchController().setPhoneData,
      ).toBeCalledWith('1');
    });
  });

  describe('setPhoneDataVersion()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setPhoneDataVersion('1');
      expect(
        rcInfoController.getRCInfoFetchController().setPhoneDataVersion,
      ).toBeCalledWith('1');
    });
  });

  describe('isVoipCallingAvailable()', () => {
    beforeEach(() => {
      clearMocks();
      userConfig = new AccountUserConfig();
    });
    it('should call controller when account type is not RC', async () => {
      userConfig.getAccountType = jest.fn().mockReturnValue('');
      const result = await rcInfoService.isVoipCallingAvailable();
      expect(result).toBeFalsy();
    });
    it('should call controller when account type is RC but isRCFeaturePermissionEnabled is false', async () => {
      userConfig.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.RC);
      rcInfoService.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockReturnValue(false);
      const result = await rcInfoService.isVoipCallingAvailable();
      expect(result).toBeFalsy();
    });
  });

  describe('getCallerIdList()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getCallerIdList();
      expect(
        rcInfoController.getRCCallerIdController().getCallerIdList,
      ).toBeCalled();
    });
  });

  describe('isRCFeaturePermissionEnabled()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.isRCFeaturePermissionEnabled(1);
      expect(
        rcInfoController.getRCPermissionController()
          .isRCFeaturePermissionEnabled,
      ).toBeCalledWith(1);
    });
  });

  describe('getCountryList()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getCountryList();
      expect(rcInfoService.regionInfoController.getCountryList).toBeCalled();
    });
  });

  describe('getCurrentCountry()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getCurrentCountry();
      expect(rcInfoService.regionInfoController.getCurrentCountry).toBeCalled();
    });
  });

  describe('setDefaultCountry()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setDefaultCountry('1');
      expect(
        rcInfoService.regionInfoController.setDefaultCountry,
      ).toBeCalledWith('1');
    });
  });
  describe('getAreaCode()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getAreaCode();
      expect(rcInfoService.regionInfoController.getAreaCode).toBeCalled();
    });
  });

  describe('setAreaCode()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setAreaCode('1');
      expect(rcInfoService.regionInfoController.setAreaCode).toBeCalledWith(
        '1',
      );
    });
  });
  describe('hasAreaCode()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.hasAreaCode('1');
      expect(rcInfoService.regionInfoController.hasAreaCode).toBeCalledWith(
        '1',
      );
    });
  });
  describe('isAreaCodeValid()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.isAreaCodeValid('1');
      expect(rcInfoService.regionInfoController.isAreaCodeValid).toBeCalledWith(
        '1',
      );
    });
  });
  describe('loadRegionInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.loadRegionInfo();
      expect(
        rcInfoController.getRegionInfoController().loadRegionInfo,
      ).toBeCalled();
    });
  });
});
