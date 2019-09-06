/*
 * @Author: Lewi.Li
 * @Date: 2019-05-11 13:30:07
 * Copyright © RingCentral. All rights reserved.
 */
import { PhoneNumberController } from '../PhoneNumberController';
import { PhoneParserUtility } from '../../../../utils/phoneParser';
import { EVENT_TYPES, notificationCenter, ENTITY } from 'sdk/service';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('../../../../utils/phoneParser');

describe('PhoneNumberController', () => {
  let phoneNumberController: PhoneNumberController;
  const mockPersonService = {
    getPhoneNumbers: jest.fn(),
  };
  beforeAll(() => {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockPersonService);
    phoneNumberController = new PhoneNumberController();
  });

  describe('generateMatchedPhoneNumberList', () => {
    it('should return list when it is short number', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockResolvedValue({
        isShortNumber: jest.fn().mockReturnValue(true),
        getE164: jest.fn().mockReturnValue('123'),
      });
      const phoneParser = (await PhoneParserUtility.getPhoneParser('123'))!;
      const res = await phoneNumberController.generateMatchedPhoneNumberList(
        '123',
        phoneParser,
      );
      expect(res.length).toBe(1);
      expect(res[0]).toBe('123');
    });

    it('should return list when it is short number and e164 number not equal to original number', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(true),
        getE164: jest.fn().mockReturnValue('456'),
      });
      const phoneParser = (await PhoneParserUtility.getPhoneParser('456'))!;
      const res = await phoneNumberController.generateMatchedPhoneNumberList(
        '123',
        phoneParser,
      );
      expect(res.length).toBe(2);
      expect(res[0]).toBe('123');
      expect(res[1]).toBe('456');
    });

    it('should return list when no country code in long phone number', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(false),
        getE164: jest.fn().mockReturnValue('+16502274787'),
        isSpecialNumber: jest.fn().mockReturnValue(false),
        getCountryCode: jest.fn().mockReturnValue(''),
      });
      const phoneParser = (await PhoneParserUtility.getPhoneParser(''))!;
      const res = await phoneNumberController.generateMatchedPhoneNumberList(
        '6502274787',
        phoneParser,
      );
      expect(res.length).toBe(2);
      expect(res[0]).toBe('6502274787');
      expect(res[1]).toBe('+16502274787');
    });
    it('should return list when local country code is same as phone number', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(false),
        getE164: jest.fn().mockReturnValue('+16502274787'),
        isSpecialNumber: jest.fn().mockReturnValue(false),
        getCountryCode: jest.fn().mockReturnValue('1'),
        getAreaCode: jest.fn().mockReturnValue('650'),
      });
      PhoneParserUtility.getStationCountryCode = jest.fn().mockReturnValue('1');
      PhoneParserUtility.getStationAreaCode = jest.fn().mockReturnValue('');
      const phoneParser = (await PhoneParserUtility.getPhoneParser(''))!;
      const res = await phoneNumberController.generateMatchedPhoneNumberList(
        '+16502274787',
        phoneParser,
      );

      expect(res.length).toBe(4);
      expect(res[0]).toBe('+16502274787');
      expect(res[1]).toBe('16502274787');
      expect(res[2]).toBe('6502274787');
      expect(res[3]).toBe('06502274787');
    });

    it('should return list when local area code is same as phone number', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(false),
        getE164: jest.fn().mockReturnValue('+16502274787'),
        isSpecialNumber: jest.fn().mockReturnValue(false),
        getCountryCode: jest.fn().mockReturnValue('1'),
        getAreaCode: jest.fn().mockReturnValue('650'),
        getNumber: jest.fn().mockReturnValue('2274787'),
      });
      const phoneParser = (await PhoneParserUtility.getPhoneParser(''))!;
      PhoneParserUtility.getStationCountryCode = jest.fn().mockReturnValue('1');
      PhoneParserUtility.getStationAreaCode = jest.fn().mockReturnValue('650');
      const res = await phoneNumberController.generateMatchedPhoneNumberList(
        '+16502274787',
        phoneParser,
      );
      expect(res.length).toBe(5);
      expect(res[0]).toBe('+16502274787');
      expect(res[1]).toBe('16502274787');
      expect(res[2]).toBe('6502274787');
      expect(res[3]).toBe('2274787');
      expect(res[4]).toBe('06502274787');
    });
  });

  describe('getLocalCanonical', () => {
    it('should call phone parse to get localCanonical', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        getLocalCanonical: jest.fn().mockReturnValue('+1(650)2274787'),
      });
      const phoneNumberController = new PhoneNumberController();
      const res = await phoneNumberController.getLocalCanonical('+16502274787');
      expect(res).toBe('+1(650)2274787');
    });
  });

  describe('getE164PhoneNumber', () => {
    it('should call phone parse to get e164 number', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        getE164: jest.fn().mockReturnValue('+16502274787'),
      });
      const phoneNumberController = new PhoneNumberController();
      const res = await phoneNumberController.getE164PhoneNumber('6502274787');
      expect(res).toBe('+16502274787');
    });
  });

  describe('isShortNumber', () => {
    it('should call phone parse to get number type', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(true),
      });
      const phoneNumberController = new PhoneNumberController();
      const res = await phoneNumberController.isShortNumber('123');
      expect(res).toBeTruthy();
    });
  });

  describe('isSpecialNumber', () => {
    it('should call phone parse to get number type', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isSpecialNumber: jest.fn().mockReturnValue(true),
      });
      const phoneNumberController = new PhoneNumberController();
      const res = await phoneNumberController.isSpecialNumber('123');
      expect(res).toBeTruthy();
    });
  });

  describe('isValidNumber', () => {
    it('should return true when phone num is 6502274787', () => {
      const res = phoneNumberController.isValidNumber('6502274787');
      expect(res).toBeTruthy();
    });

    it('should return true when phone num is (650)2274787', () => {
      const res = phoneNumberController.isValidNumber('(650)2274787');
      expect(res).toBeTruthy();
    });

    it('should return true when phone num is (650)227-4787', () => {
      const res = phoneNumberController.isValidNumber('(650)227-4787');
      expect(res).toBeTruthy();
    });

    it('should return true when phone num is +16502274787', () => {
      const res = phoneNumberController.isValidNumber('+16502274787');
      expect(res).toBeTruthy();
    });

    it('should return true when phone num is +1(650)227-4787', () => {
      const res = phoneNumberController.isValidNumber('+1(650)227-4787');
      expect(res).toBeTruthy();
    });

    it('should return true when phone num is *#123', () => {
      const res = phoneNumberController.isValidNumber('*#123');
      expect(res).toBeTruthy();
    });

    it('should return true when phone num is 650.437.1071', () => {
      const res = phoneNumberController.isValidNumber('650.437.1071');
      expect(res).toBeTruthy();
    });
  });

  describe('handlePersonPayload', () => {
    it('should emit phone number notification', () => {
      const mockData = {
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: [
            {
              rc_phone_numbers: [
                { phoneNumber: '12367' },
                { phoneNumber: '4563' },
              ],
            },
            {
              sanitized_rc_extension: { extensionNumber: '187' },
            },
          ],
        },
      } as any;
      notificationCenter.emitEntityUpdate = jest.fn();

      phoneNumberController.handlePersonPayload(mockData);
      expect(mockPersonService.getPhoneNumbers).toBeCalled();
      expect(notificationCenter.emitEntityUpdate).toBeCalled();
    });
  });
});
