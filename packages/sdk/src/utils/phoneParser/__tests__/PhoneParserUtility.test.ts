/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-03 13:48:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoUserConfig } from '../../../module/rcInfo/config';
import { PhoneParserUtility } from '../PhoneParserUtility';
import { NewGlobalConfig } from '../../../service/config';

jest.mock('../../../module/rcInfo/config');

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

  jest.spyOn(PhoneParserUtility, 'loadModule');
  jest.spyOn(PhoneParserUtility, 'onModuleLoaded');
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
  NewGlobalConfig.getPhoneData = jest.fn();
  NewGlobalConfig.setPhoneData = jest.fn();

  beforeEach(() => {
    PhoneParserUtility['_moduleLoadingTime'] = 0;
    PhoneParserUtility['_moduleLoaded'] = false;
    PhoneParserUtility['_initialized'] = false;
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
      },
    };
    phoneParserUtility = new PhoneParserUtility('', '');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadModule()', () => {
    it('should do nothing when module is loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility.loadModule();
      expect(PhoneParserUtility['_moduleLoadingTime']).toEqual(0);
    });

    it('should do nothing when module loading is not timeout', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      const currentTime = Date.now();
      PhoneParserUtility['_moduleLoadingTime'] = currentTime;
      PhoneParserUtility.loadModule();
      expect(PhoneParserUtility['_moduleLoadingTime']).toEqual(currentTime);
    });

    it('should load module when module is not loaded and timeout', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      const currentTime = Date.now() - 60000;
      PhoneParserUtility['_moduleLoadingTime'] = currentTime;
      PhoneParserUtility.loadLocalPhoneData = jest.fn();
      PhoneParserUtility.loadModule();
      expect(PhoneParserUtility['_moduleLoadingTime']).toBeGreaterThan(
        currentTime,
      );
      expect(PhoneParserUtility.loadLocalPhoneData).toBeCalledTimes(1);
    });
  });

  describe('onModuleLoaded()', () => {
    it('should set _moduleLoaded as true', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.onModuleLoaded();
      expect(PhoneParserUtility['_moduleLoaded']).toBeTruthy();
    });
  });

  describe('initPhoneParser()', () => {
    it('should load module when module is not loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      expect(PhoneParserUtility.initPhoneParser(true)).toBeFalsy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(PhoneParserUtility['_initialized']).toBeFalsy();
    });

    it('should do nothing when _initialized = true and force = false', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = true;
      expect(PhoneParserUtility.initPhoneParser(false)).toBeTruthy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initialized']).toBeTruthy();
    });

    it('should return false when _initialized = false and phoneData is invalid', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = false;
      NewGlobalConfig.getPhoneData.mockReturnValueOnce(undefined);
      expect(PhoneParserUtility.initPhoneParser(false)).toBeFalsy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(NewGlobalConfig.getPhoneData).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].ReadRootNodeByString,
      ).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initialized']).toBeFalsy();
    });

    it('should do init when _initialized = true and force = true', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = true;
      NewGlobalConfig.getPhoneData.mockReturnValueOnce(123456);
      PhoneParserUtility[ '_phoneParserModule'
].ReadRootNodeByString.mockReturnValueOnce(true);
      expect(PhoneParserUtility.initPhoneParser(true)).toBeTruthy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(NewGlobalConfig.getPhoneData).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].ReadRootNodeByString,
      ).toBeCalledWith(123456);
      expect(PhoneParserUtility['_initialized']).toBeTruthy();
    });
  });

  describe('canGetPhoneParser()', () => {
    it('should not init when phoneParser is already initialized', () => {
      PhoneParserUtility['_initialized'] = true;
      expect(PhoneParserUtility.canGetPhoneParser()).toBeTruthy();
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(0);
    });

    it('should not init when phoneParser is already initialized', () => {
      PhoneParserUtility['_initialized'] = true;
      expect(PhoneParserUtility.canGetPhoneParser()).toBeTruthy();
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(0);
    });
  });

  describe('getPhoneParser()', () => {
    it('should return undefined when phone parser is not initialized', () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(false);
      expect(PhoneParserUtility.getPhoneParser('5683', true)).toBeUndefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].NewSettingsKey,
      ).toBeCalledTimes(0);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(0);
    });

    it('should use default settingsKey when useDefaultSettingsKey = true', () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      expect(PhoneParserUtility.getPhoneParser('5683', true)).toBeDefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].NewSettingsKey,
      ).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(0);
    });

    it('should use station settingsKey when useDefaultSettingsKey = false', () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      expect(PhoneParserUtility.getPhoneParser('5683', false)).toBeDefined();
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
    it('should return undefined when phone parser is not initialized', () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(false);
      expect(PhoneParserUtility.getPhoneDataFileVersion()).toBeUndefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetPhoneDataFileVersion,
      ).toBeCalledTimes(0);
    });

    it('should return value when phone parser is initialized', () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      PhoneParserUtility[ '_phoneParserModule'
].GetPhoneDataFileVersion.mockReturnValueOnce('8.2');
      expect(PhoneParserUtility.getPhoneDataFileVersion()).toEqual('8.2');
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetPhoneDataFileVersion,
      ).toBeCalledTimes(1);
    });
  });

  describe('getStationCountryCode()', () => {
    it('should return undefined when module is not loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      expect(PhoneParserUtility.getStationCountryCode()).toBeUndefined();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationCountryCode,
      ).toBeCalledTimes(0);
    });

    it('should return value when module is loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      PhoneParserUtility[ '_phoneParserModule'
].GetStationCountryCode.mockReturnValueOnce('countryCode');
      expect(PhoneParserUtility.getStationCountryCode()).toEqual('countryCode');
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationCountryCode,
      ).toBeCalledTimes(1);
    });
  });

  describe('getStationAreaCode()', () => {
    it('should return undefined when module is not loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      expect(PhoneParserUtility.getStationAreaCode()).toBeUndefined();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationAreaCode,
      ).toBeCalledTimes(0);
    });

    it('should return value when module is loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      PhoneParserUtility[ '_phoneParserModule'
].GetStationAreaCode.mockReturnValueOnce('areaCode');
      expect(PhoneParserUtility.getStationAreaCode()).toEqual('areaCode');
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationAreaCode,
      ).toBeCalledTimes(1);
    });
  });

  describe('setStationLocation()', () => {
    it('should return false when module is not loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      expect(PhoneParserUtility.setStationLocation('1', '650')).toBeFalsy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].SetStationLocation,
      ).toBeCalledTimes(0);
    });

    it('should return true when module is loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      PhoneParserUtility[ '_phoneParserModule'
].SetStationLocation.mockImplementationOnce(() => {});
      expect(PhoneParserUtility.setStationLocation('1', '650')).toBeTruthy();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(
        PhoneParserUtility['_phoneParserModule'].SetStationLocation,
      ).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].SetStationLocation,
      ).toBeCalledWith('1', '650', 0, -1, false, '', 0, '');
    });
  });

  describe('getStationSettingsKey()', () => {
    it('should return undefined when module is not loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      expect(PhoneParserUtility.getStationSettingsKey()).toBeUndefined();
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(0);
    });

    it('should return value when module is loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      PhoneParserUtility[ '_phoneParserModule'
].GetStationSettingsKey.mockReturnValueOnce('settingsKey');
      expect(PhoneParserUtility.getStationSettingsKey()).toEqual('settingsKey');
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetStationSettingsKey,
      ).toBeCalledTimes(1);
    });
  });

  describe('getRegionalInfo()', () => {
    it('should return undefined when phone parser is not initialized', () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(false);
      expect(PhoneParserUtility.getRegionalInfo(1, '650')).toBeUndefined();
      expect(PhoneParserUtility.canGetPhoneParser).toBeCalledTimes(1);
      expect(
        PhoneParserUtility['_phoneParserModule'].GetRegionalInfo,
      ).toBeCalledTimes(0);
    });

    it('should return value when phone parser is initialized', () => {
      PhoneParserUtility.canGetPhoneParser.mockReturnValueOnce(true);
      PhoneParserUtility[ '_phoneParserModule'
].GetRegionalInfo.mockReturnValueOnce('regionalInfo');
      expect(PhoneParserUtility.getRegionalInfo(1, '650')).toEqual(
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

  describe('isStationUK()', () => {
    it('should return false when country code is not 44', () => {
      PhoneParserUtility.getStationCountryCode.mockReturnValueOnce('86');
      expect(PhoneParserUtility.isStationUK()).toBeFalsy();
    });

    it('should return true when country code is 44', () => {
      PhoneParserUtility.getStationCountryCode.mockReturnValueOnce('44');
      expect(PhoneParserUtility.isStationUK()).toBeTruthy();
    });
  });

  describe('isStationUSorCA()', () => {
    it('should return false when country code is not 1', () => {
      PhoneParserUtility.getStationCountryCode.mockReturnValueOnce('86');
      expect(PhoneParserUtility.isStationUSorCA()).toBeFalsy();
    });

    it('should return true when country code is 1', () => {
      PhoneParserUtility.getStationCountryCode.mockReturnValueOnce('1');
      expect(PhoneParserUtility.isStationUSorCA()).toBeTruthy();
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
    it('should return false when can not get phone parser', () => {
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(undefined);
      expect(phoneParserUtility.isEqualToPhoneNumber('1212')).toBeFalsy();
      expect(PhoneParserUtility.getPhoneParser).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164Extended).toBeCalledTimes(0);
    });

    it('should return false when phone numbers are different', () => {
      const mockPhoneParserUtility = new PhoneParserUtility('', '');
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(
        mockPhoneParserUtility,
      );
      mockPhoneParser.GetE164Extended.mockReturnValueOnce(
        '123',
      ).mockReturnValueOnce('321');
      expect(phoneParserUtility.isEqualToPhoneNumber('321')).toBeFalsy();
      expect(PhoneParserUtility.getPhoneParser).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164Extended).toBeCalledTimes(2);
    });

    it('should return true when phone numbers are the same', () => {
      const mockPhoneParserUtility = new PhoneParserUtility('', '');
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(
        mockPhoneParserUtility,
      );
      mockPhoneParser.GetE164Extended.mockReturnValueOnce(
        '123',
      ).mockReturnValueOnce('123');
      expect(phoneParserUtility.isEqualToPhoneNumber('123')).toBeTruthy();
      expect(PhoneParserUtility.getPhoneParser).toBeCalledTimes(1);
      expect(mockPhoneParser.GetE164Extended).toBeCalledTimes(2);
    });
  });

  describe('isInternationalDialing()', () => {
    it('should return false when is short number', () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(true);
      expect(phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when is service feature number', () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 1,
      });
      expect(phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when can not get account info', () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      RcInfoUserConfig.prototype.getAccountInfo.mockReturnValueOnce(undefined);
      expect(phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when can not get main number', () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      RcInfoUserConfig.prototype.getAccountInfo.mockReturnValueOnce({});
      expect(phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return false when can not get phone parser', () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      RcInfoUserConfig.prototype.getAccountInfo.mockReturnValueOnce({
        mainNumber: '123456',
      });
      PhoneParserUtility.getPhoneParser.mockReturnValueOnce(undefined);
      expect(phoneParserUtility.isInternationalDialing()).toBeFalsy();
    });

    it('should return true when not both are USA/Canada, and country name is different', () => {
      mockPhoneParser.IsRCExtension.mockReturnValueOnce(false);
      mockPhoneParser.GetServiceCodeType.mockReturnValueOnce({
        value: 0,
      });
      RcInfoUserConfig.prototype.getAccountInfo.mockReturnValueOnce({
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
      expect(phoneParserUtility.isInternationalDialing()).toBeTruthy();
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
