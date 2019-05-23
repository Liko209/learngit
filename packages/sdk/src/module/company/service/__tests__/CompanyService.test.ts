/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 18:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { CompanyService } from '../CompanyService';
import { SYNC_SOURCE } from '../../../../module/sync';

jest.mock('../../../../api/api');
jest.mock('../../../../dao');

const companyController = {
  getCompanyEmailDomain: jest.fn(),
  handleCompanyData: jest.fn(),
  getUserAccountTypeFromSP430: jest.fn(),
  isUserCompanyTelephonyOn: jest.fn(),
  getBrandType: jest.fn(),
};

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CompanyController', () => {
  let companyService: CompanyService;
  beforeEach(() => {
    clearMocks();
    companyService = new CompanyService();

    Object.assign(companyService, {
      _companyController: companyController,
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('CompanyController', () => {
    it('should call getCompanyEmailDomain with correct parameter ', async () => {
      await companyService.getCompanyEmailDomain(123);
      expect(companyController.getCompanyEmailDomain).toBeCalledWith(123);
    });

    it('getUserAccountTypeFromSP430, should call companyController', async () => {
      companyController.getUserAccountTypeFromSP430 = jest
        .fn()
        .mockReturnValue('value');
      const res = await companyService.getUserAccountTypeFromSP430();
      expect(res).toBe('value');
    });

    it('isUserCompanyTelephonyOn, should call companyController', async () => {
      companyController.isUserCompanyTelephonyOn = jest
        .fn()
        .mockReturnValue(true);
      const res = await companyService.isUserCompanyTelephonyOn();
      expect(res).toBeTruthy();
    });

    it('should call getBrandType in companyController', async () => {
      const result = 'RC';
      companyController.getBrandType = jest.fn().mockResolvedValue(result);
      expect(await companyService.getBrandType()).toEqual(result);
      expect(companyController.getBrandType).toBeCalled();
    });
  });

  describe('handleData', () => {
    it('should call handleData with index data', async () => {
      await companyService.handleIncomingData([], SYNC_SOURCE.INDEX);
      expect(companyController.handleCompanyData).toBeCalledWith(
        [],
        SYNC_SOURCE.INDEX,
        undefined,
      );
    });

    it('should call handleData with remaining data', async () => {
      await companyService.handleIncomingData([], SYNC_SOURCE.REMAINING);
      expect(companyController.handleCompanyData).toBeCalledWith(
        [],
        SYNC_SOURCE.REMAINING,
        undefined,
      );
    });
  });

  describe('getById', () => {
    it('should receive null when id is not correct company id', async () => {
      try {
        await companyService.getById(2);
      } catch (e) {
        expect(e).toBeNull();
      }
    });
  });
});
