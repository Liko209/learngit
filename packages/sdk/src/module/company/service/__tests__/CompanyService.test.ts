/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 18:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { CompanyService } from '../CompanyService';

jest.mock('../../../../api/api');

const companyController = {
  getCompanyEmailDomain: jest.fn(),
  handleCompanyData: jest.fn(),
};

describe('CompanyController', () => {
  let companyService: CompanyService = undefined;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    companyService = new CompanyService();

    Object.assign(companyService, {
      _companyController: companyController,
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getCompanyEmailDomain()', () => {
    it('should call getCompanyEmailDomain with correct parameter ', async () => {
      await companyService.getCompanyEmailDomain(123);
      expect(companyController.getCompanyEmailDomain).toBeCalledWith(123);
    });
  });

  describe('handleData', () => {
    it('should call handleData with correct parameter', async () => {
      await companyService.handleIncomingData([]);
      expect(companyController.handleCompanyData).toBeCalledWith([]);
    });
  });
});
