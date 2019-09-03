/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-13 13:33:37
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoService } from '../RCInfoService';
import { RCInfoController } from '../../controller/RCInfoController';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CompanyService } from 'sdk/module/company';
import { SettingService } from 'sdk/module/setting/service/SettingService';
import { AccountService } from 'sdk/module/account';
import { ACCOUNT_TYPE_ENUM } from 'sdk/authenticator/constants';
import { ERCServiceFeaturePermission } from '../../types';

jest.mock('sdk/module/setting/service/SettingService', () => {
  const mock: SettingService = {
    registerModuleSetting: jest.fn(),
    unRegisterModuleSetting: jest.fn(),
  } as any;
  return {
    SettingService: () => mock,
  };
});
jest.mock('../../controller/RCInfoFetchController');
jest.mock('../../controller/RCAccountInfoController');
jest.mock('../../controller/RCCallerIdController');
jest.mock('../../controller/RCPermissionController');
jest.mock('../../controller/RegionInfoController');
jest.mock('../../controller/RCDeviceController');
jest.mock('sdk/module/account');
jest.mock('../../controller/BlockNumberController');
jest.mock('sdk/module/company');
jest.mock('../../controller/RCPresenceController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCInfoService', () => {
  let rcInfoService: RCInfoService;
  let rcInfoController: RCInfoController;
  let mockSettingService: SettingService;
  let mockAccountService: AccountService;
  let companyService: CompanyService;

  function setup() {
    mockAccountService = new AccountService(null);
    mockAccountService.userConfig = {
      getAccountType: jest.fn(),
    };
    companyService = new CompanyService();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.COMPANY_SERVICE) {
          return companyService;
        }
        if (serviceName === ServiceConfig.SETTING_SERVICE) {
          return mockSettingService;
        }
        if (serviceName === ServiceConfig.ACCOUNT_SERVICE) {
          return mockAccountService;
        }
      });
  }

  beforeEach(() => {
    clearMocks();

    mockSettingService = new SettingService();
    const rawGetInstance = (key: string) => ServiceLoader.getInstance(key);
    ServiceLoader.getInstance = jest.fn().mockImplementation((key: any) => {
      if (key === ServiceConfig.SETTING_SERVICE) {
        return mockSettingService;
      }
      return rawGetInstance(key);
    });
    rcInfoService = new RCInfoService();
    rcInfoController = new RCInfoController({} as any);
    setup();
    rcInfoService['_DBConfig'] = {} as any;
    rcInfoService['_rcInfoController'] = rcInfoController;
  });
  describe('getRCClientInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCClientInfo();
      expect(
        rcInfoController.getRCInfoFetchController().getRCClientInfo,
      ).toHaveBeenCalled();
    });
  });

  describe('requestRCInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.requestRCInfo();
      expect(
        rcInfoController.getRCInfoFetchController().requestRCInfo,
      ).toHaveBeenCalled();
    });
  });

  describe('requestRCAccountRelativeInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.requestRCAccountRelativeInfo();
      expect(
        rcInfoController.getRCInfoFetchController()
          .requestRCAccountRelativeInfo,
      ).toHaveBeenCalled();
    });
  });

  describe('getRCAccountInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCAccountInfo();
      expect(
        rcInfoController.getRCInfoFetchController().getRCAccountInfo,
      ).toHaveBeenCalled();
    });
  });

  describe('getRCBrandId()', () => {
    it('should call controller with correct parameter', async () => {
      await rcInfoService.getRCBrandId();
      expect(
        rcInfoController.getRCAccountInfoController().getAccountBrandId,
      ).toHaveBeenCalled();
    });
  });

  describe('getAccountMainNumber()', () => {
    it('should call controller with correct parameter', async () => {
      await rcInfoService.getAccountMainNumber();
      expect(
        rcInfoController.getRCAccountInfoController().getAccountMainNumber,
      ).toHaveBeenCalled();
    });
  });

  describe('getRCAccountId()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCAccountId();
      expect(
        rcInfoController.getRCAccountInfoController().getRCAccountId,
      ).toHaveBeenCalled();
    });
  });

  describe('getRCExtensionId()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCExtensionId();
      expect(
        rcInfoController.getRCInfoFetchController().getRCExtensionId,
      ).toHaveBeenCalled();
    });
  });

  describe('getRCExtensionInfo()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCExtensionInfo();
      expect(
        rcInfoController.getRCInfoFetchController().getRCExtensionInfo,
      ).toHaveBeenCalled();
    });
  });

  describe('getRCRolePermissions()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getRCRolePermissions();
      expect(
        rcInfoController.getRCInfoFetchController().getRCRolePermissions,
      ).toHaveBeenCalled();
    });
  });

  describe('getSpecialNumberRule()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getSpecialNumberRule();
      expect(
        rcInfoController.getRCInfoFetchController().getSpecialNumberRule,
      ).toHaveBeenCalled();
    });
  });
  describe('getPhoneData()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getPhoneData();
      expect(
        rcInfoController.getRCInfoFetchController().getPhoneData,
      ).toHaveBeenCalled();
    });
  });

  describe('setPhoneData()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setPhoneData('1');
      expect(
        rcInfoController.getRCInfoFetchController().setPhoneData,
      ).toHaveBeenCalledWith('1');
    });
  });

  describe('setPhoneDataVersion()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setPhoneDataVersion('1');
      expect(
        rcInfoController.getRCInfoFetchController().setPhoneDataVersion,
      ).toHaveBeenCalledWith('1');
    });
  });

  describe('getCallerIdList()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getCallerIdList();
      expect(
        rcInfoController.getRCCallerIdController().getCallerIdList,
      ).toHaveBeenCalled();
    });
  });

  describe('getDefaultCallerId()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getDefaultCallerId();
      expect(
        rcInfoController.getRCCallerIdController().getDefaultCallerId,
      ).toHaveBeenCalled();
    });
  });

  describe('setDefaultCallerId()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setDefaultCallerId(1);
      expect(
        rcInfoController.getRCCallerIdController().setDefaultCallerId,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllCountryList', () => {
    it('should call controller with correct parameter', async () => {
      await rcInfoService.getAllCountryList();
      expect(
        rcInfoController.getRegionInfoController().getAllCountryList,
      ).toHaveBeenCalled();
    });
  });

  describe('getStateList', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getStateList('1');
      expect(
        rcInfoController.getRegionInfoController().getStateList,
      ).toHaveBeenCalledWith('1');
    });
  });

  describe('getDefaultCallerId()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.hasSetCallerId();
      expect(
        rcInfoController.getRCCallerIdController().hasSetCallerId,
      ).toHaveBeenCalled();
    });
  });

  describe('isRCFeaturePermissionEnabled()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.isRCFeaturePermissionEnabled(1);
      expect(
        rcInfoController.getRCPermissionController()
          .isRCFeaturePermissionEnabled,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('getCountryList()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getCountryList();
      expect(
        rcInfoService['regionInfoController'].getCountryList,
      ).toHaveBeenCalled();
    });
  });

  describe('getCurrentCountry()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getCurrentCountry();
      expect(
        rcInfoService['regionInfoController'].getCurrentCountry,
      ).toHaveBeenCalled();
    });
  });

  describe('setDefaultCountry()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setDefaultCountry('1');
      expect(
        rcInfoService['regionInfoController'].setDefaultCountry,
      ).toHaveBeenCalledWith('1');
    });
  });
  describe('getAreaCode()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getAreaCode();
      expect(
        rcInfoService['regionInfoController'].getAreaCode,
      ).toHaveBeenCalled();
    });
  });

  describe('setAreaCode()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.setAreaCode('1');
      expect(
        rcInfoService['regionInfoController'].setAreaCode,
      ).toHaveBeenCalledWith('1');
    });
  });
  describe('hasAreaCode()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.hasAreaCode('1');
      expect(
        rcInfoService['regionInfoController'].hasAreaCode,
      ).toHaveBeenCalledWith('1');
    });
  });
  describe('isAreaCodeValid()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.isAreaCodeValid('1');
      expect(
        rcInfoService['regionInfoController'].isAreaCodeValid,
      ).toHaveBeenCalledWith('1');
    });
  });

  describe('loadRegionInfo', () => {
    const regionInfoController = {
      loadRegionInfo: jest.fn(),
    };

    beforeEach(() => {
      clearMocks();
      rcInfoController.getRegionInfoController = jest
        .fn()
        .mockReturnValue(regionInfoController);
    });

    it('should call load region info when has voip permission', async () => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockResolvedValue(true);
      await rcInfoService.loadRegionInfo();
      expect(regionInfoController.loadRegionInfo).toHaveBeenCalled();
      expect(rcInfoService.isVoipCallingAvailable).toHaveBeenCalled();
    });

    it('should not call load region info when does not have voip permission', async () => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockResolvedValue(false);
      await rcInfoService.loadRegionInfo();
      expect(regionInfoController.loadRegionInfo).not.toHaveBeenCalled();
      expect(rcInfoService.isVoipCallingAvailable).toHaveBeenCalled();
    });
  });

  describe('isVoipCallingAvailable', () => {
    it('should return false when user is not rc account and not permission', async () => {
      mockAccountService.userConfig = {
        getAccountType: jest.fn().mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP),
      };
      rcInfoService.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockImplementation((permission: ERCServiceFeaturePermission) => {
          if (permission === ERCServiceFeaturePermission.VOIP_CALLING) {
            return false;
          }
          if (permission === ERCServiceFeaturePermission.WEB_PHONE) {
            return true;
          }
        });
      const result = await rcInfoService.isVoipCallingAvailable();
      expect(result).toBeFalsy();
    });
    it('should return true when user is rc account and has permission', async () => {
      mockAccountService.userConfig = {
        getAccountType: jest.fn().mockReturnValue(ACCOUNT_TYPE_ENUM.RC),
      };
      rcInfoService.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockImplementation((permission: ERCServiceFeaturePermission) => {
          if (permission === ERCServiceFeaturePermission.VOIP_CALLING) {
            return true;
          }
          if (permission === ERCServiceFeaturePermission.WEB_PHONE) {
            return true;
          }
        });
      const result = await rcInfoService.isVoipCallingAvailable();
      expect(result).toBeTruthy();
    });
    it('should return false when user is rc account and has not web_phone permission [JPT-2924]', async () => {
      mockAccountService.userConfig = {
        getAccountType: jest.fn().mockReturnValue(ACCOUNT_TYPE_ENUM.RC),
      };
      rcInfoService.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockImplementation((permission: ERCServiceFeaturePermission) => {
          if (permission === ERCServiceFeaturePermission.VOIP_CALLING) {
            return true;
          }
          if (permission === ERCServiceFeaturePermission.WEB_PHONE) {
            return false;
          }
        });
      const result = await rcInfoService.isVoipCallingAvailable();
      expect(result).toBeFalsy();
    });
  });

  describe('isWebPhoneAvailable', () => {
    it('should return false if user is not rc account', async () => {
      mockAccountService.userConfig = {
        getAccountType: jest.fn().mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP),
      };
      const result = await rcInfoService.isWebPhoneAvailable();
      expect(result).toBeFalsy();
    });
    it('should return false if user has not web phone permission', async () => {
      mockAccountService.userConfig = {
        getAccountType: jest.fn().mockReturnValue(ACCOUNT_TYPE_ENUM.RC),
      };
      rcInfoService.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockResolvedValue(false);
      const result = await rcInfoService.isWebPhoneAvailable();
      expect(result).toBeFalsy();
    });
    it('should return false if user is rc account and  has not web phone permission', async () => {
      mockAccountService.userConfig = {
        getAccountType: jest.fn().mockReturnValue(ACCOUNT_TYPE_ENUM.RC),
      };
      rcInfoService.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockResolvedValue(true);
      const result = await rcInfoService.isWebPhoneAvailable();
      expect(result).toBeTruthy();
    });
  });

  describe('onStart', () => {
    it('should call registerModuleSetting', () => {
      rcInfoService['_rcInfoSettings'] = {} as any;
      // mockProfileSetting.unsubscribe = jest.fn();
      rcInfoService['onStarted']();
      expect(mockSettingService.registerModuleSetting).toHaveBeenCalledWith({});
    });
  });

  describe('onStop', () => {
    it('should call unRegisterModuleSetting', () => {
      rcInfoService['_rcInfoSettings'] = {} as any;
      // mockProfileSetting.unsubscribe = jest.fn();
      rcInfoService['onStopped']();
      expect(mockSettingService.unRegisterModuleSetting).toHaveBeenCalledWith(
        {},
      );
    });
  });

  describe('isNumberBlocked()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.isNumberBlocked('1123');
      expect(
        rcInfoService['getRCInfoController']().blockNumberController
          .isNumberBlocked,
      ).toHaveBeenCalledWith('1123');
    });
  });

  describe('getDigitalLines()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.getDigitalLines();
      expect(
        rcInfoService['getRCInfoController']().getRCInfoFetchController()
          .getDigitalLines,
      ).toHaveBeenCalled();
    });
  });

  describe('assignLine()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.assignLine('1', 'test');
      expect(
        rcInfoService['getRCInfoController']().getRCDeviceController()
          .assignLine,
      ).toHaveBeenCalledWith('1', 'test');
    });
  });

  describe('updateLine()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.updateLine('1', 'test');
      expect(
        rcInfoService['getRCInfoController']().getRCDeviceController()
          .updateLine,
      ).toHaveBeenCalledWith('1', 'test');
    });
  });

  describe('deleteBlockedNumbers()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.deleteBlockedNumbers(['1123', '6']);
      expect(
        rcInfoService['getRCInfoController']().blockNumberController
          .deleteBlockedNumbers,
      ).toHaveBeenCalledWith(['1123', '6']);
    });
  });

  describe('addBlockedNumber()', () => {
    it('should call controller with correct parameter', () => {
      rcInfoService.addBlockedNumber('1123');
      expect(
        rcInfoService['getRCInfoController']().blockNumberController
          .addBlockedNumber,
      ).toHaveBeenCalledWith('1123');
    });
  });

  describe('syncRCPresence()', () => {
    it('should call controller with correct parameter', () => {
      const controller = rcInfoService['getRCInfoController']()
        .rcPresenceController;
      controller.syncRCPresence = jest.fn();
      rcInfoService.syncUserRCPresence();
      expect(controller.syncRCPresence).toHaveBeenCalled();
    });
  });
});
