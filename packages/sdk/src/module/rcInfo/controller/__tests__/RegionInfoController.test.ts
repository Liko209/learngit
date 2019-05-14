/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-01 07:58:26
 * Copyright © RingCentral. All rights reserved.
 */
import { AccountServiceInfoController } from '../AccountServiceInfoController';
import { RCInfoFetchController } from '../RCInfoFetchController';
import { RCAccountInfoController } from '../RCAccountInfoController';
import { RegionInfoController } from '../RegionInfoController';
import { PhoneParserUtility } from '../../../../utils/phoneParser';
import { RCCallerIdController } from '../RCCallerIdController';
import { RCBrandType } from '../../types';
import { notificationCenter } from 'sdk/service';
import { RCInfoGlobalConfig } from '../../config';
import { AccountUserConfig } from '../../../account/config';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../../config');
jest.mock('../../../account/config');
jest.mock('../../../../utils/phoneParser');
jest.mock('../RCAccountInfoController');
jest.mock('../RCInfoFetchController');
jest.mock('../AccountServiceInfoController');
jest.mock('../RCCallerIdController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const DefaultCountryInfo = {
  id: '1',
  name: 'United States',
  isoCode: 'US',
  callingCode: '1',
};

const validDialingPlan = {
  records: [
    {
      id: '53',
      name: 'Costa Rica',
      isoCode: 'CR',
      callingCode: '506',
    },
  ],
};

describe('RegionInfoController', () => {
  let _rcCallerIdController: RCCallerIdController;
  let _rcInfoFetchController: RCInfoFetchController;
  let _rcAccountInfoController: RCAccountInfoController;
  let _accountServiceInfoController: AccountServiceInfoController;
  let regionInfoController: RegionInfoController;

  function setUpNormalEnv() {
    _rcInfoFetchController.getDialingPlan = jest
      .fn()
      .mockResolvedValue(validDialingPlan);
    _rcAccountInfoController.getAccountMainNumber = jest
      .fn()
      .mockResolvedValue('+868552198030');
    PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValueOnce({
      getCountryCode: () => {
        return '86';
      },
    });
    _rcCallerIdController.getCallerIdList = jest.fn().mockResolvedValue([]);
  }
  function setUp() {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: AccountUserConfig.prototype };
        }
        return;
      });
    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(1);
    _rcInfoFetchController = new RCInfoFetchController();
    _rcCallerIdController = new RCCallerIdController(_rcInfoFetchController);
    _rcAccountInfoController = new RCAccountInfoController(
      _rcInfoFetchController,
    );
    _accountServiceInfoController = new AccountServiceInfoController(
      _rcInfoFetchController,
    );
    regionInfoController = new RegionInfoController(
      _rcInfoFetchController,
      _rcAccountInfoController,
      _accountServiceInfoController,
      _rcCallerIdController,
    );
  }

  describe('hasAreaCode', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it.each`
      callingCode | result
      ${'1'}      | ${true}
      ${'86'}     | ${true}
      ${'61'}     | ${true}
      ${'52'}     | ${true}
      ${'2'}      | ${false}
    `(
      'should have areacode $callingCode, $result',
      ({ callingCode, result }) => {
        expect(regionInfoController.hasAreaCode(callingCode)).toEqual(result);
      },
    );
  });

  describe('init', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call notification center to subscribe notification ', () => {
      notificationCenter.on = jest.fn();
      regionInfoController.init();
      expect(notificationCenter.on).toBeCalledWith(
        'RC_INFO.EXTENSION_PHONE_NUMBER_LIST',
        expect.anything(),
      );
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call notification center to unsubscribe notification ', () => {
      notificationCenter.off = jest.fn();
      regionInfoController.dispose();
      expect(notificationCenter.off).toBeCalledWith(
        'RC_INFO.EXTENSION_PHONE_NUMBER_LIST',
        expect.anything(),
      );
    });
  });

  describe('isAreaCodeValid', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should pass to phone parser and get result', async () => {
      regionInfoController['_currentCountryInfo'] = { id: '2' } as any;
      PhoneParserUtility.isAreaCodeValid = jest.fn().mockResolvedValue(false);
      const res = await regionInfoController.isAreaCodeValid('123');
      expect(PhoneParserUtility.isAreaCodeValid).toBeCalledWith(2, '123');
      expect(res).toBeFalsy();
    });

    it('should pass default data to phone parser and get result when has no current country ', async () => {
      regionInfoController['_currentCountryInfo'] = undefined as any;
      PhoneParserUtility.isAreaCodeValid = jest.fn().mockResolvedValue(true);
      const res = await regionInfoController.isAreaCodeValid('123');
      expect(PhoneParserUtility.isAreaCodeValid).toBeCalledWith(1, '123');
      expect(res).toBeTruthy();
    });
  });

  describe('getCountryList', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      _rcCallerIdController.getCallerIdList = jest.fn().mockResolvedValue([]);
    });

    it('should return country list from dialing plan when has dialing plan ', async () => {
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(validDialingPlan);

      expect(await regionInfoController.getCountryList()).toEqual(
        validDialingPlan.records,
      );
    });

    it('should return country list from account home city when has no dialing plan', async () => {
      _rcAccountInfoController.getHomeCountry = jest.fn().mockResolvedValue({
        callingCode: '54',
        id: '11',
        isoCode: 'AR',
        name: 'Argentina',
      });
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(undefined);
      _rcAccountInfoController.getAccountMainNumber = jest
        .fn()
        .mockResolvedValue('+868552198030');
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValueOnce({
        getCountryCode: () => {
          return '54';
        },
      });
      expect(await regionInfoController.getCountryList()).toEqual([
        { callingCode: '54', id: '11', isoCode: 'AR', name: 'Argentina' },
      ]);

      expect(PhoneParserUtility.getPhoneParser).toBeCalledWith(
        '+868552198030',
        false,
      );
    });

    it('should return country list from account main number when has account main number ', async () => {
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(undefined);
      _rcAccountInfoController.getAccountMainNumber = jest
        .fn()
        .mockResolvedValue('+868552198030');
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValueOnce({
        getCountryCode: () => {
          return '86';
        },
      });
      expect(await regionInfoController.getCountryList()).toEqual([
        { callingCode: '86', id: '46', isoCode: 'CN', name: 'China' },
      ]);

      expect(PhoneParserUtility.getPhoneParser).toBeCalledWith(
        '+868552198030',
        false,
      );
    });

    it('should return country list from user first did when has user did', async () => {
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(undefined);
      _rcAccountInfoController.getAccountMainNumber = jest
        .fn()
        .mockResolvedValue('+123456');
      _rcCallerIdController.getCallerIdList = jest
        .fn()
        .mockResolvedValue([
          { phoneNumber: '+12052770634', usageType: 'DirectNumber' },
          { phoneNumber: '+868552198030', usageType: 'DirectNumber' },
        ]);
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValueOnce({
        getCountryCode: () => {
          return '39';
        },
      });
      expect(await regionInfoController.getCountryList()).toEqual([
        { id: '109', name: 'Italy', isoCode: 'IT', callingCode: '39' },
      ]);

      expect(PhoneParserUtility.getPhoneParser).toBeCalledWith(
        '+12052770634',
        false,
      );
    });

    it('should return default country when has no dialing plan and account main number ', async () => {
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(undefined);
      _rcAccountInfoController.getAccountMainNumber = jest
        .fn()
        .mockResolvedValue(undefined);

      expect(await regionInfoController.getCountryList()).toEqual([
        { callingCode: '1', id: '1', isoCode: 'US', name: 'United States' },
      ]);
      expect(PhoneParserUtility.getPhoneParser).not.toBeCalled();
    });
  });

  describe('getCurrentCountry', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(validDialingPlan);
      _rcCallerIdController.getCallerIdList = jest.fn().mockResolvedValue([]);
    });

    it('should return country from dialing plan when has dialing plan', async () => {
      regionInfoController['_getCountryFromAccountInfo'] = jest.fn();
      regionInfoController['loadRegionInfo'] = jest
        .fn()
        .mockImplementation(() => {
          regionInfoController['_currentCountryInfo'] = {
            isoCode: 'CR',
          } as any;
        });
      expect(await regionInfoController.getCurrentCountry()).toEqual(
        validDialingPlan.records[0],
      );
      expect(regionInfoController['loadRegionInfo']).toBeCalled();
      expect(
        regionInfoController['_getCountryFromAccountInfo'],
      ).not.toBeCalled();
    });

    it('should return country from account info when has no dialing plan', async () => {
      regionInfoController['_currentCountryInfo'] = { isoCode: 'CR' } as any;
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(undefined);
      _rcAccountInfoController.getAccountMainNumber = jest
        .fn()
        .mockResolvedValue('+868552198030');
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValueOnce({
        getCountryCode: () => {
          return '86';
        },
      });
      expect(await regionInfoController.getCurrentCountry()).toEqual({
        callingCode: '86',
        id: '46',
        isoCode: 'CN',
        name: 'China',
      });
    });

    it('should return country from user did when has did only', async () => {
      regionInfoController['_currentCountryInfo'] = { isoCode: 'CR' } as any;
      _rcInfoFetchController.getDialingPlan = jest
        .fn()
        .mockResolvedValue(undefined);
      _rcAccountInfoController.getAccountMainNumber = jest
        .fn()
        .mockResolvedValue('+12345678');
      _rcCallerIdController.getCallerIdList = jest
        .fn()
        .mockResolvedValue('+868552198030');
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValueOnce({
        getCountryCode: () => {
          return '86';
        },
      });
      expect(await regionInfoController.getCurrentCountry()).toEqual({
        callingCode: '86',
        id: '46',
        isoCode: 'CN',
        name: 'China',
      });
    });
  });

  describe('setDefaultCountry', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call _setStationLocation to set country code', async () => {
      setUpNormalEnv();
      regionInfoController['_setStationLocation'] = jest.fn();
      await regionInfoController.setDefaultCountry('US');
      expect(regionInfoController['_setStationLocation']).toBeCalledWith({
        areaCode: '',
        areaCodeByManual: false,
        newCountryInfo: {
          callingCode: '86',
          id: '46',
          isoCode: 'CN',
          name: 'China',
        },
      });
    });
  });

  describe('setAreaCode', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call _setStationLocation to set area code', async () => {
      setUpNormalEnv();
      regionInfoController['_currentCountryInfo'] = {
        id: '53',
        name: 'Costa Rica',
        isoCode: 'CR',
        callingCode: '506',
      };
      regionInfoController['_setStationLocation'] = jest.fn();
      await regionInfoController.setAreaCode('123');
      expect(regionInfoController['_setStationLocation']).toBeCalledWith({
        areaCode: '123',
        newCountryInfo: {
          id: '53',
          name: 'Costa Rica',
          isoCode: 'CR',
          callingCode: '506',
        },
      });
    });
  });

  describe('getAreaCode', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should get area code from phone parser ', async () => {
      PhoneParserUtility.getStationAreaCode = jest
        .fn()
        .mockResolvedValue('123');
      expect(await regionInfoController.getAreaCode()).toEqual('123');
    });
  });

  describe('loadRegionInfo', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should set default country when has no local setting', async () => {
      RCInfoGlobalConfig.getStationLocation = jest
        .fn()
        .mockReturnValue(undefined);
      regionInfoController['_setStationLocation'] = jest.fn();
      await regionInfoController.loadRegionInfo();
      expect(regionInfoController['_setStationLocation']).toBeCalledWith({
        newCountryInfo: DefaultCountryInfo,
        areaCode: '',
        updateSpecialNumber: true,
        areaCodeByManual: false,
        countryByManual: false,
      });
      regionInfoController['_currentCountryInfo'] = DefaultCountryInfo;
    });

    it('should get region setting from db and set it', async () => {
      const setting = {
        1: {
          countryInfo: { id: 10 },
          areaCode: '123',
          areaCodeByManual: false,
          countryByManual: true,
        },
        2: {},
      };
      RCInfoGlobalConfig.getStationLocation = jest
        .fn()
        .mockReturnValue(setting);
      regionInfoController['_setStationLocation'] = jest.fn();
      await regionInfoController.loadRegionInfo();
      expect(regionInfoController['_setStationLocation']).toBeCalledWith({
        areaCode: '123',
        areaCodeByManual: false,
        countryByManual: true,
        newCountryInfo: { id: 10 },
        updateSpecialNumber: true,
      });
      expect(regionInfoController['_currentCountryInfo']).toEqual(
        setting['1'].countryInfo,
      );
    });
  });

  describe('_getRightAreaCode', () => {
    const myCountryInfo = {
      callingCode: '86',
      id: '46',
      isoCode: 'CN',
      name: 'China',
    };

    beforeEach(() => {
      clearMocks();
      setUp();
      _rcCallerIdController.getCallerIdList = jest
        .fn()
        .mockResolvedValue(undefined);
      regionInfoController['_currentCountryInfo'] = { id: '1' } as any;
      PhoneParserUtility.getRegionalInfo = jest.fn().mockReturnValue({
        areaCode: '123',
        HasBan: () => {
          return false;
        },
      });
    });

    it('should return empty string when the country does not support area code', async () => {
      const res = await regionInfoController['_getRightAreaCode'](
        {
          id: 111,
        },
        '021',
        true,
      );
      expect(res).toEqual('');
    });

    it('should return area code in region when region has ban is false', async () => {
      PhoneParserUtility.getRegionalInfo = jest.fn().mockResolvedValue({
        areaCode: '123',
        HasBan: () => {
          return false;
        },
      });
      const res = await regionInfoController['_getRightAreaCode'](
        myCountryInfo,
        '',
        true,
      );
      expect(PhoneParserUtility.getRegionalInfo).toBeCalledWith(46, '');
      expect(res).toEqual('123');
    });

    it('should return area code from main number when has no caller id and no area code', async () => {
      _rcAccountInfoController.getAccountMainNumber = jest
        .fn()
        .mockResolvedValue('+868552198030');
      PhoneParserUtility.getPhoneParser = jest.fn().mockResolvedValue({
        isTollFree: () => {
          return false;
        },
        getCountryId: () => {
          return 1;
        },
        getAreaCode: () => {
          return '888';
        },
      });
      PhoneParserUtility.getRegionalInfo = jest
        .fn()
        .mockResolvedValueOnce({
          areaCode: '123',
          HasBan: () => {
            return true;
          },
        })
        .mockResolvedValueOnce({
          areaCode: '666',
          HasBan: () => {
            return false;
          },
        });
      const res = await regionInfoController['_getRightAreaCode'](
        myCountryInfo,
        '199',
        true,
      );
      expect(PhoneParserUtility.getRegionalInfo).nthCalledWith(1, 46, '199');
      expect(PhoneParserUtility.getRegionalInfo).nthCalledWith(2, 46, '888');
      expect(res).toEqual('666');
    });

    it('should use old area code when no need to update area code', async () => {
      PhoneParserUtility.getRegionalInfo = jest.fn().mockResolvedValue({
        areaCode: '123',
        HasBan: () => {
          return true;
        },
      });
      const res = await regionInfoController['_getRightAreaCode'](
        myCountryInfo,
        '199',
        false,
        {
          areaCodeByManual: true,
          areaCode: '777',
        } as any,
      );
      expect(res).toEqual('');
    });
  });

  describe('_setStationLocation', () => {
    const myCountryInfo = {
      callingCode: '86',
      id: '46',
      isoCode: 'CN',
      name: 'China',
    };

    beforeEach(() => {
      clearMocks();
      setUp();
      RCInfoGlobalConfig.setStationLocation = jest.fn();
      RCInfoGlobalConfig.getStationLocation = jest.fn().mockReturnValue({
        1: { areaCodeByManual: false, countryByManual: false },
      });
      _rcAccountInfoController.getOutboundCallPrefix = jest
        .fn()
        .mockReturnValueOnce('9');
      _accountServiceInfoController.getMaxExtensionNumberLength = jest
        .fn()
        .mockResolvedValue(7);
      _accountServiceInfoController.getShortExtensionNumberLength = jest
        .fn()
        .mockResolvedValue(3);
      _rcAccountInfoController.getAccountBrandId = jest
        .fn()
        .mockResolvedValue('1210');
      _rcInfoFetchController.requestSpecialNumberRule = jest.fn();

      _rcInfoFetchController.getRCExtensionInfo = jest
        .fn()
        .mockResolvedValue({ site: { code: '123' } });

      regionInfoController['_getRightAreaCode'] = jest
        .fn()
        .mockResolvedValue('021');

      PhoneParserUtility.setStationLocation = jest.fn();
    });

    it('should not update region when country is set by manual and new coming is set by auto', async () => {
      RCInfoGlobalConfig.getStationLocation = jest.fn().mockReturnValue({
        1: { areaCodeByManual: true, countryByManual: true },
      });
      await regionInfoController['_setStationLocation']({
        areaCode: '',
        newCountryInfo: myCountryInfo,
        areaCodeByManual: false,
        countryByManual: false,
      });
      expect(PhoneParserUtility.setStationLocation).not.toBeCalled();
    });

    it('should set default country for ATT user', async () => {
      _rcAccountInfoController.getAccountBrandId = jest
        .fn()
        .mockResolvedValue('3420');
      _rcAccountInfoController.getBrandID2Type = jest
        .fn()
        .mockResolvedValue(RCBrandType.ATT);
      await regionInfoController['_setStationLocation']({
        areaCode: '',
        newCountryInfo: myCountryInfo,
        areaCodeByManual: true,
        countryByManual: true,
        updateSpecialNumber: false,
      });
      expect(PhoneParserUtility.setStationLocation).toBeCalledWith({
        brandId: 3420,
        maxShortLen: 7,
        outboundCallPrefix: '9',
        shortPinLen: 3,
        siteCode: '123',
        szAreaCode: '021',
        szCountryCode: '1',
      });
    });

    it('should set region to DB and update n11 number if need when setStationLocation', async () => {
      _rcInfoFetchController.getSpecialNumberRuleByCountryId = jest
        .fn()
        .mockResolvedValue(undefined);

      await regionInfoController['_setStationLocation']({
        areaCode: '',
        newCountryInfo: myCountryInfo,
      });
      expect(RCInfoGlobalConfig.setStationLocation).toBeCalledWith({
        1: {
          areaCode: '021',
          areaCodeByManual: true,
          countryByManual: true,
          countryInfo: myCountryInfo,
        },
      });
      expect(regionInfoController['_currentCountryInfo']).toEqual(
        myCountryInfo,
      );
      expect(PhoneParserUtility.setStationLocation).toBeCalledWith({
        brandId: 1210,
        maxShortLen: 7,
        outboundCallPrefix: '9',
        shortPinLen: 3,
        siteCode: '123',
        szAreaCode: '021',
        szCountryCode: '86',
      });
      expect(_rcInfoFetchController.requestSpecialNumberRule).toBeCalledWith();
    });
  });
});
