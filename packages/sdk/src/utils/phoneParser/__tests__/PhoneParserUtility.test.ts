/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-03 13:48:30
 * Copyright © RingCentral. All rights reserved.
 */

import {
  Module,
  localPhoneDataPath,
  SettingsKey,
  RegionalInfo,
  PhoneParser,
  ModuleParams,
  ModuleClass,
  ModuleType,
  mainLogger,
} from 'foundation';
import fs from 'fs';
import { RcInfoConfig } from '../../../module/rcInfo/config';
import { RcAccountInfo } from '../../../api/ringcentral/types/RcAccountInfo';
import { PhoneParserUtility } from '../PhoneParserUtility';

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
  jest.spyOn(PhoneParserUtility, 'getPhoneData');
  jest.spyOn(PhoneParserUtility, 'canGetPhoneParser');
  jest.spyOn(PhoneParserUtility, 'getPhoneDataFileVersion');
  jest.spyOn(PhoneParserUtility, 'getStationCountryCode');
  jest.spyOn(PhoneParserUtility, 'getStationAreaCode');
  jest.spyOn(PhoneParserUtility, 'setStationLocation');
  jest.spyOn(PhoneParserUtility, 'getStationSettingsKey');
  jest.spyOn(PhoneParserUtility, 'getRegionalInfo');
  jest.spyOn(PhoneParserUtility, 'isStationUK');
  jest.spyOn(PhoneParserUtility, 'isStationUSorCA');
  jest.spyOn(PhoneParserUtility, '_initByPhoneData');

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
      PhoneParserUtility.loadModule();
      expect(PhoneParserUtility['_moduleLoadingTime']).toBeGreaterThan(
        currentTime,
      );
    });
  });

  describe('onModuleLoaded()', () => {
    it('should set _moduleLoaded as true', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.onModuleLoaded();
      expect(PhoneParserUtility['_moduleLoaded']).toEqual(true);
    });
  });

  describe('initPhoneParser()', () => {
    it('should load module when module is not loaded', () => {
      PhoneParserUtility['_moduleLoaded'] = false;
      PhoneParserUtility.loadModule.mockImplementationOnce(() => {});
      expect(PhoneParserUtility.initPhoneParser(true)).toEqual(false);
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(1);
      expect(PhoneParserUtility['_initByPhoneData']).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initialized']).toEqual(false);
    });

    it('should do nothing when _initialized = true and force = false', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = true;
      expect(PhoneParserUtility.initPhoneParser(false)).toEqual(true);
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initByPhoneData']).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initialized']).toEqual(true);
    });

    it('should do init when _initialized = false', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = false;
      PhoneParserUtility['_initByPhoneData'].mockReturnValueOnce(true);
      expect(PhoneParserUtility.initPhoneParser(false)).toEqual(true);
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initByPhoneData']).toBeCalledTimes(1);
      expect(PhoneParserUtility['_initialized']).toEqual(true);
    });

    it('should do init when _initialized = true and force = true', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = true;
      PhoneParserUtility['_initByPhoneData'].mockReturnValueOnce(true);
      expect(PhoneParserUtility.initPhoneParser(true)).toEqual(true);
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initByPhoneData']).toBeCalledTimes(1);
      expect(PhoneParserUtility['_initialized']).toEqual(true);
    });

    it('should do init by local data when newest data is not exist', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = false;
      PhoneParserUtility['_initByPhoneData']
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      expect(PhoneParserUtility.initPhoneParser(true)).toEqual(true);
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initByPhoneData']).toBeCalledTimes(2);
      expect(PhoneParserUtility['_initialized']).toEqual(true);
    });

    it('should return false when init failed', () => {
      PhoneParserUtility['_moduleLoaded'] = true;
      PhoneParserUtility['_initialized'] = false;
      PhoneParserUtility['_initByPhoneData']
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      expect(PhoneParserUtility.initPhoneParser(true)).toEqual(false);
      expect(PhoneParserUtility.loadModule).toBeCalledTimes(0);
      expect(PhoneParserUtility['_initByPhoneData']).toBeCalledTimes(2);
      expect(PhoneParserUtility['_initialized']).toEqual(false);
    });
  });

  describe('getPhoneData()', () => {
    beforeAll(() => {
      jest.spyOn(fs, 'readFileSync');
      jest.spyOn(RcInfoConfig, 'getRcPhoneData');
    });

    it('should get from local when fromLocal = true', () => {
      fs.readFileSync.mockReturnValueOnce('localData');
      expect(PhoneParserUtility.getPhoneData(true)).toEqual('localData');
      expect(fs.readFileSync).toBeCalledTimes(1);
      expect(RcInfoConfig.getRcPhoneData).toBeCalledTimes(0);
    });

    it('should return undefined when can not get local data', () => {
      fs.readFileSync.mockImplementationOnce(() => {
        throw '';
      });
      expect(PhoneParserUtility.getPhoneData(true)).toEqual(undefined);
      expect(fs.readFileSync).toBeCalledTimes(1);
      expect(RcInfoConfig.getRcPhoneData).toBeCalledTimes(0);
    });

    it('should get newest when fromLocal = false', () => {
      RcInfoConfig.getRcPhoneData.mockReturnValueOnce('newestData');
      expect(PhoneParserUtility.getPhoneData(false)).toEqual('newestData');
      expect(fs.readFileSync).toBeCalledTimes(0);
      expect(RcInfoConfig.getRcPhoneData).toBeCalledTimes(1);
    });

    it('should return undefined when can not get newest data', () => {
      RcInfoConfig.getRcPhoneData.mockReturnValueOnce('');
      expect(PhoneParserUtility.getPhoneData(false)).toEqual(undefined);
      expect(fs.readFileSync).toBeCalledTimes(0);
      expect(RcInfoConfig.getRcPhoneData).toBeCalledTimes(1);
    });
  });

  describe('canGetPhoneParser()', () => {
    it('should not init when phoneParser is already initialized', () => {
      PhoneParserUtility['_initialized'] = true;
      expect(PhoneParserUtility.canGetPhoneParser()).toEqual(true);
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(0);
    });

    it('should not init when phoneParser is already initialized', () => {
      PhoneParserUtility['_initialized'] = true;
      expect(PhoneParserUtility.canGetPhoneParser()).toEqual(true);
      expect(PhoneParserUtility.initPhoneParser).toBeCalledTimes(0);
    });
  });
});
