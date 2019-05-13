/*
 * @Author: Lewi.Li
 * @Date: 2019-05-10 16:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import { PhoneNumberService } from '../PhoneNumberService';
import { PhoneNumberController } from '../../controller/PhoneNumberController';
import { PhoneParserUtility } from '../../../../utils/phoneParser';

jest.mock('../../../../utils/phoneParser');

describe('PhoneNumberService', () => {
  const ID = '123';
  let phoneNumberController: PhoneNumberController;
  let phoneNumberService: PhoneNumberService;

  beforeEach(() => {
    phoneNumberService = new PhoneNumberService(false);
    phoneNumberController = new PhoneNumberController();
    Object.assign(phoneNumberService, {
      _phoneNumberController: phoneNumberController,
    });
  });

  describe('getById', async () => {
    it('should return id as phone number', async () => {
      const res = await phoneNumberService.getById(ID);
      expect(res.id).toBe(ID);
    });
  });

  describe('getSynchronously', () => {
    it('should return id as phone number', () => {
      const res = phoneNumberService.getSynchronously(ID);
      expect(res.id).toBe(ID);
    });
  });

  describe('getE164PhoneNumber', () => {
    it('should call controller to get e164', async () => {
      const spy = jest.spyOn(phoneNumberController, 'getE164PhoneNumber');
      await phoneNumberService.getE164PhoneNumber('123');
      expect(spy).toBeCalledWith('123');
    });
  });
  describe('getLocalCanonical', async () => {
    it('should call controller to get local canonical', async () => {
      const spy = jest.spyOn(phoneNumberController, 'getLocalCanonical');
      await phoneNumberService.getLocalCanonical('123');
      expect(spy).toBeCalledWith('123');
    });
  });
  describe('generateMatchedPhoneNumberList', async () => {
    it('should call controller to get number list', async () => {
      const spy = jest.spyOn(
        phoneNumberController,
        'generateMatchedPhoneNumberList',
      );
      await phoneNumberService.generateMatchedPhoneNumberList('123');
      expect(spy).toBeCalledWith('123');
    });
  });
});
