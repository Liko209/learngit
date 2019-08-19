/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-03 13:48:30
 * Copyright © RingCentral. All rights reserved.
 */

import { PhoneParserUtility } from '../PhoneParserUtility';
import notificationCenter from '../../../service/notificationCenter';
import { ServiceLoader } from '../../../module/serviceLoader';
import { MODULE_STATUS } from '../constants';
import { ModuleParams } from 'foundation/telephony';

const mockModuleFunc = jest.fn();
jest.mock('foundation/telephony', () => {
  return {
    Module: (params: ModuleParams) => {
      mockModuleFunc();
      return { params };
    },
  };
});

describe('PhoneParserUtility', () => {
  let phoneParserUtility: PhoneParserUtility;
  const mockPhoneParser = {
    GetE164Extended: jest.fn(),
    GetE164TAS: jest.fn(),
    GetCanonical: jest.fn(),
    GetLocalCanonical: jest.fn(),
    IsRCExtension: jest.fn(),
    IsTollFree: jest.fn(),
    IsSpecialNumber: jest.fn(),
    GetServiceCodeType: jest.fn(),
    CheckValidForCountry: jest.fn(),
    GetSpecialPrefixMask: jest.fn(),
    GetSpecialNumberTemplate: jest.fn(),
    IsEmpty: jest.fn(),
    GetNumber: jest.fn(),
    GetCountryCode: jest.fn(),
    GetAreaCode: jest.fn(),
    GetCountryId: jest.fn(),
    GetCountryName: jest.fn(),
    GetDialable: jest.fn(),
    GetDtmfPostfix: jest.fn(),
  };

  notificationCenter.on = jest.fn();
  notificationCenter.off = jest.fn();
  const mockRCInfoService = {
    getPhoneData: jest.fn(),
    getRCAccountInfo: jest.fn(),
    setPhoneDataVersion: jest.fn(),
    loadRegionInfo: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(PhoneParserUtility, 'loadModule');
    jest.spyOn(PhoneParserUtility, 'loadLocalPhoneData');
    jest.spyOn(PhoneParserUtility, 'initPhoneParser');
    jest.spyOn(PhoneParserUtility, 'canGetPhoneParser');
    jest.spyOn(PhoneParserUtility, 'getPhoneParser');
    jest.spyOn(PhoneParserUtility, 'getPhoneDataFileVersion');
    jest.spyOn(PhoneParserUtility, 'getStationCountryCode');
    jest.spyOn(PhoneParserUtility, 'getStationAreaCode');
    jest.spyOn(PhoneParserUtility, 'setStationLocation');
    jest.spyOn(PhoneParserUtility, 'getStationSettingsKey');
    jest.spyOn(PhoneParserUtility, 'getRegionalInfo');
    jest.spyOn(PhoneParserUtility, 'isStationUK');
    jest.spyOn(PhoneParserUtility, 'isStationUSorCA');
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockRCInfoService);

    PhoneParserUtility['_moduleStatus'] = MODULE_STATUS.IDLE;
    PhoneParserUtility['_loadingQueue'] = [];
    PhoneParserUtility['_initialized'] = false;
    PhoneParserUtility['_localPhoneDataLoaded'] = false;
    PhoneParserUtility['_phoneParserModule'] = {
      NewSettingsKey: jest.fn(),
      NewPhoneParser: jest.fn().mockReturnValue(mockPhoneParser),
      ReadRootNodeByString: jest.fn(),
      GetPhoneDataFileVersion: jest.fn(),
      GetStationCountryCode: jest.fn(),
      GetStationAreaCode: jest.fn(),
      SetStationLocation: jest.fn(),
      GetStationSettingsKey: jest.fn(),
      GetRegionalInfo: jest.fn(),
      EnPDServiceCodeType: {
        enPDSFTUnknown: {
          value: 0,
        },
      } as any,
    };
    phoneParserUtility = new PhoneParserUtility('', '');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('loadModule()', () => {
    it('should do nothing when moduleStatus is loaded', async () => {
      PhoneParserUtility['_moduleStatus'] = MODULE_STATUS.LOADED;
      expect(await PhoneParserUtility.loadModule()).toBeTruthy();
      expect(notificationCenter.on).not.toBeCalled();
    });

    it('should wait the result and push the promise to queue when moduleStatus is loading', async () => {
      PhoneParserUtility['_moduleStatus'] = MODULE_STATUS.LOADING;
      const waiter = PhoneParserUtility.loadModule();
      expect(notificationCenter.on).not.toBeCalled();
      expect(PhoneParserUtility['_loadingQueue'].length).toEqual(1);
      PhoneParserUtility['_loadingQueue'][0](false);
      await new Promise(resolve => {
        waiter.then(result => {
          expect(result).toBeFalsy();
          resolve();
        });
      });
    });

    it('should resolve all loading as true when moduleStatus is idle and load success', async () => {
      PhoneParserUtility['_moduleStatus'] = MODULE_STATUS.IDLE;
      PhoneParserUtility.loadLocalPhoneData.mockResolvedValueOnce(undefined);
      PhoneParserUtility.loadLocalPhoneData.mockImplementationOnce(() => {});

      const waiter1 = PhoneParserUtility.loadModule();
      const waiter2 = PhoneParserUtility.loadModule();
      expect(notificationCenter.on).toBeCalledTimes(2);
      expect(PhoneParserUtility['_loadingQueue'].length).toEqual(1);
      PhoneParserUtility['_phoneParserModule']['params'].onRuntimeInitialized();
      expect(PhoneParserUtility['_moduleStatus']).toEqual(MODULE_STATUS.LOADED);
      expect(PhoneParserUtility['_loadingQueue']).toEqual([]);
      expect(PhoneParserUtility.loadLocalPhoneData).toBeCalled();
      await new Promise(resolve => {
        waiter1.then(result => {
          expect(result).toBeTruthy();
          resolve();
        });
      });
      await new Promise(resolve => {
        waiter2.then(result => {
          expect(result).toBeTruthy();
          resolve();
        });
      });
    });

    it('should resolve all loading as false when moduleStatus is idle and load failed', async () => {
      PhoneParserUtility['_moduleStatus'] = MODULE_STATUS.IDLE;
      PhoneParserUtility.loadLocalPhoneData.mockResolvedValueOnce(undefined);
      PhoneParserUtility.loadLocalPhoneData.mockImplementationOnce(() => {});
      mockModuleFunc.mockImplementationOnce(() => {
        throw 'mock';
      });
      const waiter = new Promise(resolve => {
        PhoneParserUtility['_loadingQueue'].push(resolve);
      });
      expect(await PhoneParserUtility.loadModule()).toBeFalsy();
      expect(notificationCenter.on).toBeCalledTimes(2);
      expect(notificationCenter.off).toBeCalledTimes(2);
      expect(PhoneParserUtility['_loadingQueue']).toEqual([]);
      expect(PhoneParserUtility['_moduleStatus']).toEqual(MODULE_STATUS.IDLE);
      await new Promise(resolve => {
        waiter.then(result => {
          expect(result).toBeFalsy();
          resolve();
        });
      });
    });
  });

  describe('loadLocalPhoneData()', () => {
    it('should do nothing when _localPhoneDataLoaded = true', async () => {
      PhoneParserUtility['_localPhoneDataLoaded'] = true;
      await PhoneParserUtility.loadLocalPhoneData();
      expect(mockRCInfoService.getPhoneData).not.toBeCalled();
      expect(PhoneParserUtility['_localPhoneDataLoaded']).toBeTruthy();
    });

    it('should do nothing when phoneData is already exist', async () => {
      mockRCInfoService.getPhoneData.mockReturnValueOnce('phoneData');
      await PhoneParserUtility.loadLocalPhoneData();
      expect(mockRCInfoService.getPhoneData).toBeCalled();
      expect(PhoneParserUtility['_localPhoneDataLoaded']).toBeTruthy();
    });
  });

  describe('initPhoneParser()', () => {
    it('should return false when moduleStatus is not loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(false);
      expect(await PhoneParserUtility.initPhoneParser(true)).toBeFalsy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(PhoneParserUtility['_initialized']).toBeFalsy();
    });

    it('should do nothing when _initialized = true and force = false', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(true);
      PhoneParserUtility['_initialized'] = true;
      expect(await PhoneParserUtility.initPhoneParser(false)).toBeTruthy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(PhoneParserUtility['_initialized']).toBeTruthy();
    });

    it('should return false when _initialized = false and phoneData is invalid', async () => {
      PhoneParserUtility['_notifyReadPhoneDataFinished'] = jest.fn();
      PhoneParserUtility.loadModule.mockResolvedValueOnce(true);
      PhoneParserUtility['_initialized'] = false;
      mockRCInfoService.getPhoneData.mockReturnValueOnce(undefined);
      expect(await PhoneParserUtility.initPhoneParser(false)).toBeFalsy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(mockRCInfoService.getPhoneData).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].ReadRootNodeByString,
      ).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initialized']).toBeFalsy();
      expect(PhoneParserUtility['_notifyReadPhoneDataFinished']).toBeCalledWith(false);
    });

    it('should do init when _initialized = true and force = true', async () => {
      PhoneParserUtility['_notifyReadPhoneDataFinished'] = jest.fn();
      PhoneParserUtility.loadModule.mockResolvedValueOnce(true);
      PhoneParserUtility['_initialized'] = true;
      mockRCInfoService.getPhoneData.mockReturnValueOnce(123456);
      PhoneParserUtility[
        '_phoneParserModule'
      ].ReadRootNodeByString.mockReturnValueOnce(true);
      PhoneParserUtility[
        '_phoneParserModule'
      ].GetPhoneDataFileVersion.mockReturnValueOnce('1.3');
      expect(await PhoneParserUtility.initPhoneParser(true)).toBeTruthy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(mockRCInfoService.getPhoneData).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].ReadRootNodeByString,
      ).toBeCalledWith(123456);
      expect(mockRCInfoService.setPhoneDataVersion).toBeCalledWith('1.3');
      expect(mockRCInfoService.loadRegionInfo).toHaveBeenCalled();
      expect(PhoneParserUtility['_initialized']).toBeTruthy();
      expect(PhoneParserUtility['_notifyReadPhoneDataFinished']).toBeCalledWith(true);
    });
  });

  describe('canGetPhoneParser()', () => {
    it('should not init when phoneParser is already initialized', async () => {
      PhoneParserUtility['_initialized'] = true;
      expect(await PhoneParserUtility.canGetPhoneParser()).toBeTruthy();
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(0);
    });

    it('should init when phoneParser is not initialized', async () => {
      PhoneParserUtility.initPhoneParser.mockReturnValueOnce(true);
      expect(await PhoneParserUtility.canGetPhoneParser()).toBeTruthy();
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(1);
    });
  });

  describe('getPhoneParser()', () => {
    it('should return undefined when phone parser is not initialized', async () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(false);
      expect(
        await PhoneParserUtility.getPhoneParser('5683', true),
      ).toBeUndefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].NewSettingsKey,
      ).toBeCalledTimes(0);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(0);
    });

    it('should use default settingsKey when useDefaultSettingsKey = true', async () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      expect(
        await PhoneParserUtility.getPhoneParser('5683', true),
      ).toBeDefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].NewSettingsKey,
      ).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(0);
    });

    it('should use station settingsKey when useDefaultSettingsKey = false', async () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      expect(
        await PhoneParserUtility.getPhoneParser('5683', false),
      ).toBeDefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].NewSettingsKey,
      ).toBeCalledTimes(0);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(1);
    });
  });

  describe('getPhoneDataFileVersion()', () => {
    it('should return undefined when phone parser is not initialized', async () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(false);
      expect(
        await PhoneParserUtility.getPhoneDataFileVersion(),
      ).toBeUndefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetPhoneDataFileVersion,
      ).toBeCalledTimes(0);
    });

    it('should return value when phone parser is initialized', async () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      PhoneParserUtility[
        '_phoneParserModule'
      ].GetPhoneDataFileVersion.mockReturnValueOnce('8.2');
      expect(await PhoneParserUtility.getPhoneDataFileVersion()).toEqual('8.2');
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetPhoneDataFileVersion,
      ).toBeCalledTimes(1);
    });
  });

  describe('getStationCountryCode()', () => {
    it('should return undefined when module is not loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(false);
      expect(await PhoneParserUtility.getStationCountryCode()).toBeUndefined();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationCountryCode,
      ).toBeCalledTimes(0);
    });

    it('should return value when module is loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(true);
      PhoneParserUtility[
        '_phoneParserModule'
      ].GetStationCountryCode.mockReturnValueOnce('countryCode');
      expect(await PhoneParserUtility.getStationCountryCode()).toEqual(
        'countryCode',
      );
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationCountryCode,
      ).toBeCalledTimes(1);
    });
  });

  describe('getStationAreaCode()', () => {
    it('should return undefined when module is not loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(false);
      expect(await PhoneParserUtility.getStationAreaCode()).toBeUndefined();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationAreaCode,
      ).toBeCalledTimes(0);
    });

    it('should return value when module is loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(true);
      PhoneParserUtility[
        '_phoneParserModule'
      ].GetStationAreaCode.mockReturnValueOnce('areaCode');
      expect(await PhoneParserUtility.getStationAreaCode()).toEqual('areaCode');
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationAreaCode,
      ).toBeCalledTimes(1);
    });
  });

  describe('setStationLocation()', () => {
    it('should return false when module is not loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(false);
      expect(
        await PhoneParserUtility.setStationLocation({
          szCountryCode: '1',
          szAreaCode: '650',
        }),
      ).toBeFalsy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].SetStationLocation,
      ).toBeCalledTimes(0);
    });

    it('should return true when module is loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(true);
      // prettier-ignore
      PhoneParserUtility['_phoneParserModule'].SetStationLocation.mockImplementationOnce(() => {});
      expect(
        await PhoneParserUtility.setStationLocation({
          szCountryCode: '1',
          szAreaCode: '650',
        }),
      ).toBeTruthy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].SetStationLocation,
      ).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].SetStationLocation,
      ).toBeCalledWith('1', '650', 0, -1, false, '', 0, '');
    });
  });

  describe('getStationSettingsKey()', () => {
    it('should return undefined when module is not loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(false);
      expect(await PhoneParserUtility.getStationSettingsKey()).toBeUndefined();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(0);
    });

    it('should return value when module is loaded', async () => {
      PhoneParserUtility.loadModule.mockResolvedValueOnce(true);
      PhoneParserUtility[
        '_phoneParserModule'
      ].GetStationSettingsKey.mockReturnValueOnce('settingsKey');
      expect(await PhoneParserUtility.getStationSettingsKey()).toEqual(
        'settingsKey',
      );
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(1);
    });
  });

  describe('getRegionalInfo()', () => {
    it('should return undefined when phone parser is not initialized', async () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(false);
      expect(
        await PhoneParserUtility.getRegionalInfo(1, '650'),
      ).toBeUndefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetRegionalInfo,
      ).toBeCalledTimes(0);
    });

    it('should return value when phone parser is initialized', async () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      PhoneParserUtility[
        '_phoneParserModule'
      ].GetRegionalInfo.mockReturnValueOnce('regionalInfo');
      expect(await PhoneParserUtility.getRegionalInfo(1, '650')).toEqual(
        'regionalInfo',
      );
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetRegionalInfo,
      ).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetRegionalInfo,
      ).toBeCalledWith(1, '650');
    });
  });

  describe('isAreaCodeValid', () => {
    it('should return false when regionalInfo is invalid', async () => {
      PhoneParserUtility.getRegionalInfo.mockReturnValueOnce(undefined);
      expect(await PhoneParserUtility.isAreaCodeValid(1, '1')).toBeFalsy();
    });
    it('should return true when area code is valid', async () => {
      PhoneParserUtility.getRegionalInfo.mockReturnValueOnce({
        HasBan: jest.fn().mockReturnValue(false),
      });
      expect(await PhoneParserUtility.isAreaCodeValid(1, '1')).toBeTruthy();
    });
  });

  describe('isStationUK()', () => {
    it('should return false when country code is not 44', async () => {
      PhoneParserUtility.getStationCountryCode.mockResolvedValueOnce('86');
      expect(await PhoneParserUtility.isStationUK()).toBeFalsy();
    });

    it('should return true when country code is 44', async () => {
      PhoneParserUtility.getStationCountryCode.mockResolvedValueOnce('44');
      expect(await PhoneParserUtility.isStationUK()).toBeTruthy();
    });
  });

  describe('isStationUSorCA()', () => {
    it('should return false when country code is not 1', async () => {
      PhoneParserUtility.getStationCountryCode.mockResolvedValueOnce('86');
      expect(await PhoneParserUtility.isStationUSorCA()).toBeFalsy();
    });

    it('should return true when country code is 1', async () => {
      PhoneParserUtility.getStationCountryCode.mockResolvedValueOnce('1');
      expect(await PhoneParserUtility.isStationUSorCA()).toBeTruthy();
    });
  });

  describe('getE164()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetE164Extended.mockReturnValueOnce('1212');
      expect(phoneParserUtility.getE164()).toEqual('1212');
      expect(mockPhoneParser.GetE164Extended).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164Extended).toBeCalledWith(true);
    });
  });

  describe('getE164TAS()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetE164TAS.mockReturnValueOnce('121212');
      expect(phoneParserUtility.getE164TAS()).toEqual('121212');
      expect(mockPhoneParser.GetE164TAS).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164TAS).toBeCalledWith(false);
    });
  });

  describe('getCanonical()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetCanonical.mockReturnValueOnce('131313');
      expect(phoneParserUtility.getCanonical()).toEqual('131313');
      expect(mockPhoneParser.GetCanonical).toBeCalledTimes(1);
      expect(mockPhoneParser.GetCanonical).toBeCalledWith(true);
    });
  });

  describe('getLocalCanonical()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetLocalCanonical.mockReturnValueOnce('1313');
      expect(phoneParserUtility.getLocalCanonical()).toEqual('1313');
      expect(mockPhoneParser.GetLocalCanonical).toBeCalledTimes(1);
      expect(mockPhoneParser.GetLocalCanonical).toBeCalledWith(true);
    });
  });

  describe('isShortNumber()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(true);
      expect(phoneParserUtility.isShortNumber()).toBeTruthy();
      expect(mockPhoneParser.IsRCExtension).toBeCalledTimes(1);
    });
  });

  describe('isTollFree()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.IsTollFree.mockReturnValueOnce(true);
      expect(phoneParserUtility.isTollFree()).toBeTruthy();
      expect(mockPhoneParser.IsTollFree).toBeCalledTimes(1);
    });
  });

  describe('isSpecialNumber()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.IsSpecialNumber.mockReturnValueOnce(true);
      expect(phoneParserUtility.isSpecialNumber()).toBeTruthy();
      expect(mockPhoneParser.IsSpecialNumber).toBeCalledTimes(1);
    });
  });

  describe('isServiceFeatureNumber()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 1,
      });
      expect(phoneParserUtility.isServiceFeatureNumber()).toBeTruthy();
      expect(mockPhoneParser.GetServiceCodeType).toBeCalledTimes(1);
    });
  });

  describe('checkValidForCountry()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.CheckValidForCountry.mockReturnValueOnce(false);
      expect(phoneParserUtility.checkValidForCountry(true)).toBeFalsy();
      expect(mockPhoneParser.CheckValidForCountry).toBeCalledTimes(1);
      expect(mockPhoneParser.CheckValidForCountry).toBeCalledWith(true);
    });
  });

  describe('getSpecialPrefixMask()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetSpecialPrefixMask.mockReturnValueOnce('mask');
      expect(phoneParserUtility.getSpecialPrefixMask()).toEqual('mask');
      expect(mockPhoneParser.GetSpecialPrefixMask).toBeCalledTimes(1);
    });
  });

  describe('getSpecialNumberTemplate()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetSpecialNumberTemplate.mockReturnValueOnce('number');
      expect(phoneParserUtility.getSpecialNumberTemplate()).toEqual('number');
      expect(mockPhoneParser.GetSpecialNumberTemplate).toBeCalledTimes(1);
    });
  });

  describe('isEmpty()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.IsEmpty.mockReturnValueOnce(false);
      expect(phoneParserUtility.isEmpty()).toBeFalsy();
      expect(mockPhoneParser.IsEmpty).toBeCalledTimes(1);
    });
  });

  describe('isValid()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetNumber.mockReturnValueOnce('1212');
      expect(phoneParserUtility.isValid()).toBeTruthy();
      expect(mockPhoneParser.GetNumber).toBeCalledTimes(1);
    });
  });

  describe('isEqualToPhoneNumber()', () => {
    it('should return false when can not get phone parser', async () => {
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(undefined);
      expect(await phoneParserUtility.isEqualToPhoneNumber('1212')).toBeFalsy();
      expect(PhoneParserUtility.getPhoneParser).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164Extended).toBeCalledTimes(0);
    });

    it('should return false when phone numbers are different', async () => {
      const mockPhoneParserUtility = new PhoneParserUtility('', '');
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(
        mockPhoneParserUtility,
      );
      mockPhoneParser.GetE164Extended.mockReturnValueOnce(
        '123',
      ).mockReturnValueOnce('321');
      expect(await phoneParserUtility.isEqualToPhoneNumber('321')).toBeFalsy();
      expect(PhoneParserUtility.getPhoneParser).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164Extended).toBeCalledTimes(2);
    });

    it('should return true when phone numbers are the same', async () => {
      const mockPhoneParserUtility = new PhoneParserUtility('', '');
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(
        mockPhoneParserUtility,
      );
      mockPhoneParser.GetE164Extended.mockReturnValueOnce(
        '123',
      ).mockReturnValueOnce('123');
      expect(await phoneParserUtility.isEqualToPhoneNumber('123')).toBeTruthy();
      expect(PhoneParserUtility.getPhoneParser).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164Extended).toBeCalledTimes(2);
    });
  });

  describe('isInternationalDialing()', () => {
    it('should return false when is short number', async () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(true);
      expect(await phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when is service feature number', async () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 1,
      });
      expect(await phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when can not get account info', async () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      mockRCInfoService.getRCAccountInfo.mockReturnValueOnce(undefined);
      expect(await phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when can not get main number', async () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      mockRCInfoService.getRCAccountInfo.mockReturnValueOnce({});
      expect(await phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when can not get phone parser', async () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      mockRCInfoService.getRCAccountInfo.mockReturnValueOnce({
        mainNumber: '123456',
      });
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(undefined);
      expect(await phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return true when not both are USA/Canada, and country name is different', async () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      mockRCInfoService.getRCAccountInfo.mockReturnValueOnce({
        mainNumber: '123456',
      });
      const mockPhoneParserUtility = new PhoneParserUtility('', '');
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(
        mockPhoneParserUtility,
      );
      mockPhoneParser.GetCountryId.mockReturnValueOnce(1).mockReturnValueOnce(
        86,
      );
      mockPhoneParser.GetCountryName.mockReturnValueOnce(
        'USA',
      ).mockReturnValueOnce('China');
      expect(await phoneParserUtility.isInternationalDialing()).toBeTruthy();
    });
  });

  describe('getCountryCode()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetCountryCode.mockReturnValueOnce('86');
      expect(phoneParserUtility.getCountryCode()).toEqual('86');
    });
  });

  describe('getAreaCode()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetAreaCode.mockReturnValueOnce('0591');
      expect(phoneParserUtility.getAreaCode()).toEqual('0591');
    });
  });

  describe('getCountryId()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetCountryId.mockReturnValueOnce(86);
      expect(phoneParserUtility.getCountryId()).toEqual(86);
    });
  });

  describe('isUSAOrCanada()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetCountryId.mockReturnValueOnce(1);
      expect(phoneParserUtility.isUSAOrCanada()).toBeTruthy();
      mockPhoneParser.GetCountryId.mockReturnValueOnce(39);
      expect(phoneParserUtility.isUSAOrCanada()).toBeTruthy();
      mockPhoneParser.GetCountryId.mockReturnValueOnce(86);
      expect(phoneParserUtility.isUSAOrCanada()).toBeFalsy();
    });
  });

  describe('getCountryName()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetCountryName.mockReturnValueOnce('USA');
      expect(phoneParserUtility.getCountryName()).toEqual('USA');
    });
  });

  describe('getDialableNumber()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetDialable.mockReturnValueOnce('345');
      expect(phoneParserUtility.getDialableNumber()).toEqual('345');
      expect(mockPhoneParser.GetDialable).toBeCalledWith(false);
    });
  });

  describe('getNumber()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetNumber.mockReturnValueOnce('756');
      expect(phoneParserUtility.getNumber()).toEqual('756');
    });
  });

  describe('getDtmfPostfix()', () => {
    it('should call phone parser', () => {
      mockPhoneParser.GetDtmfPostfix.mockReturnValueOnce('86');
      expect(phoneParserUtility.getDtmfPostfix()).toEqual('86');
    });
  });
});
