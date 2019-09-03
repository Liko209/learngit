/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-04 14:59:52
 * Copyright © RingCentral. All rights reserved.
 */

import { MakeCallController } from '../MakeCallController';
import { MAKE_CALL_ERROR_CODE, E911_STATUS } from '../../types';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { IPersonService } from 'sdk/module/person/service/IPersonService';
import { IRCInfoService } from 'sdk/module/rcInfo/service/IRCInfoService';
import { IPhoneNumberService } from 'sdk/module/phoneNumber/service/IPhoneNumberService';

jest.mock('../../../../module/config');
jest.mock('../../../../utils/phoneParser');
jest.mock('../../../person');
jest.mock('../../../rcInfo/service');

describe('MakeCallController', () => {
  let makeCallController: MakeCallController;

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  class mockPersonService implements IPersonService {
    matchContactByPhoneNumber() { }
  }
  class mockRcInfoService implements IRCInfoService {
    getDigitalLines() { }
    getCurrentCountry() { }
    getDefaultCountryInfo() { }
  }
  class mockPhoneNumberService implements IPhoneNumberService {
    getE164PhoneNumber(phoneNumber: string) { }
    isSpecialNumber(phoneNumber: string) { }
  }

  let personService: mockPersonService;
  let rcInfoService: mockRcInfoService;
  let phoneNumberService: mockPhoneNumberService;

  beforeEach(() => {
    clearMocks();
    personService = new mockPersonService();
    rcInfoService = new mockRcInfoService();
    phoneNumberService = new mockPhoneNumberService();
    makeCallController = new MakeCallController(
      personService,
      phoneNumberService,
      rcInfoService,
    );
    rcInfoService.getDefaultCountryInfo = jest.fn().mockReturnValue({ id: '1' });
    rcInfoService.getCurrentCountry = jest.fn().mockReturnValue({ id: '224' });
  });
  describe('tryMakeCall', () => {
    it('should return error when there is no internet connection', async () => {
      jest
        .spyOn(makeCallController, '_checkInternetConnection')
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION);
      const result = await makeCallController.tryMakeCall('123');
      expect(result.result).toBe(MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION);
    });

    it('should return directly if it is no special number', async () => {
      phoneNumberService.getE164PhoneNumber = jest
        .fn()
        .mockReturnValue('+16502274787');
      makeCallController['_isExtension'] = jest.fn();
      phoneNumberService.isSpecialNumber = jest.fn().mockReturnValue(false);
      const res = await makeCallController.tryMakeCall('6502274787');
      expect(makeCallController['_isExtension']).not.toHaveBeenCalled();
      expect(res).toEqual({
        result: MAKE_CALL_ERROR_CODE.NO_ERROR,
        finalNumber: '+16502274787',
        countryId: '224',
      });
    });

    it('should return as ext if special number is same as extension [JPT-2828]', async () => {
      phoneNumberService.getE164PhoneNumber = jest
        .fn()
        .mockReturnValue('+86110');
      phoneNumberService.isSpecialNumber = jest.fn().mockReturnValue(true);
      personService.matchContactByPhoneNumber = jest.fn().mockReturnValue({});
      rcInfoService.getDigitalLines = jest.fn();
      const res = await makeCallController.tryMakeCall('110');
      expect(rcInfoService.getDigitalLines).not.toHaveBeenCalled();
      expect(res).toEqual({
        result: MAKE_CALL_ERROR_CODE.NO_ERROR,
        finalNumber: '110',
        countryId: '1',
      });
    });

    it('should not dial out special number if no DL', async () => {
      phoneNumberService.getE164PhoneNumber = jest
        .fn()
        .mockReturnValue('+86110');
      phoneNumberService.isSpecialNumber = jest.fn().mockReturnValue(true);
      personService.matchContactByPhoneNumber = jest.fn().mockReturnValue(null);
      rcInfoService.getDigitalLines = jest.fn().mockReturnValue([]);
      const res = await makeCallController.tryMakeCall('110');
      expect(res).toEqual({
        result: MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER,
        finalNumber: '+86110',
        countryId: '224',
      });
    });

    it('should be able to dial out special number if DL is there [JPT-2805]', async () => {
      phoneNumberService.getE164PhoneNumber = jest
        .fn()
        .mockReturnValue('+86110');
      phoneNumberService.isSpecialNumber = jest.fn().mockReturnValue(true);
      personService.matchContactByPhoneNumber = jest.fn().mockReturnValue(null);
      rcInfoService.getDigitalLines = jest.fn().mockReturnValue([1, 2]);
      const res = await makeCallController.tryMakeCall('110');
      expect(res).toEqual({
        result: MAKE_CALL_ERROR_CODE.NO_ERROR,
        finalNumber: '+86110',
        countryId: '224',
      });
    });
  });
});
