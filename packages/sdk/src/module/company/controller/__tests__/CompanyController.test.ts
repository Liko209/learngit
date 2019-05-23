/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 14:44:35
 * Copyright © RingCentral. All rights reserved.
 */

import { CompanyController } from '../CompanyController';
import { transform } from '../../../../service/utils';
import notificationCenter from '../../../../service/notificationCenter';
import { rawCompanyFactory } from '../../../../__tests__/factories';
import { SYNC_SOURCE } from '../../../../module/sync/types';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../../../account/config/AccountUserConfig', () => {
  const xx = {
    getCurrentCompanyId: jest.fn(),
  };
  return {
    AccountUserConfig: () => {
      return xx;
    },
  };
});

jest.mock('../../../../framework/controller/impl/EntitySourceController');

jest.mock('../../../../service/utils', () => ({
  transform: jest.fn(),
}));

jest.mock('../../../../service/notificationCenter', () => ({
  emitEntityUpdate: jest.fn(),
}));

const requestController = {
  get: jest.fn(),
};

const entitySourceController: any = {
  bulkUpdate: jest.fn(),
  bulkPut: jest.fn(),
  get: jest.fn(),
  getRequestController: () => {
    return requestController;
  },
};

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CompanyController', () => {
  let companyController: CompanyController;
  let accountUserConfig: AccountUserConfig;
  function setUp() {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: accountUserConfig };
        }
      });
    accountUserConfig = new AccountUserConfig();
    companyController = new CompanyController(entitySourceController);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getCompanyEmailDomain()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return company id when webmail_person_id > 0 ', async () => {
      const company = {
        id: 1,
        domain: ['aaa', 'bbb', 'ccc'],
        webmail_person_id: 123,
      };
      entitySourceController.get.mockResolvedValueOnce(company);
      const res = await companyController.getCompanyEmailDomain(company.id);
      expect(res).toBe(company.id.toString());
      expect(entitySourceController.get).toBeCalledWith(company.id);
    });

    it('should return first company domain when webmail_person_id < 0, and has multiple domains', async () => {
      const company = {
        id: 1,
        domain: ['aaa', 'bbb', 'ccc'],
        webmail_person_id: -123,
      };
      entitySourceController.get.mockResolvedValueOnce(company);
      const res = await companyController.getCompanyEmailDomain(company.id);
      expect(res).toBe('aaa');
      expect(entitySourceController.get).toBeCalledWith(company.id);
    });

    it('should return company domain when dont have webmail_person_id  and has one domain', async () => {
      const company = { id: 1, domain: 'ddd' };
      entitySourceController.get.mockResolvedValueOnce(company);
      const res = await companyController.getCompanyEmailDomain(company.id);
      expect(res).toBe('ddd');
      expect(entitySourceController.get).toBeCalledWith(company.id);
    });
  });

  describe('Company Service handleData', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('handleData for an empty array', async () => {
      await companyController.handleCompanyData([], SYNC_SOURCE.INITIAL);
      expect(transform).toHaveBeenCalledTimes(0);
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalled();
      expect(entitySourceController.bulkUpdate).not.toHaveBeenCalled();
    });

    it('should emit notification when handleData from index', async () => {
      await companyController.handleCompanyData(
        [
          rawCompanyFactory.build({ _id: 1 }),
          rawCompanyFactory.build({ _id: 2 }),
        ],
        SYNC_SOURCE.INDEX,
      );
      expect(transform).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
      expect(entitySourceController.bulkPut).toHaveBeenCalled();
    });

    it('should not emit notification when handleData from remaining', async () => {
      await companyController.handleCompanyData(
        [
          rawCompanyFactory.build({ _id: 1 }),
          rawCompanyFactory.build({ _id: 2 }),
        ],
        SYNC_SOURCE.REMAINING,
      );
      expect(transform).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalled();
      expect(entitySourceController.bulkPut).toHaveBeenCalled();
    });
  });

  describe('isUserCompanyTelephonyOn', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return false when can not find the company', async () => {
      accountUserConfig.getCurrentCompanyId = jest.fn().mockReturnValue(16385);
      entitySourceController.get = jest.fn().mockReturnValue(undefined);
      const res = await companyController.isUserCompanyTelephonyOn();
      expect(res).toBeFalsy();
    });

    it('should return false when company does not allow to use phone', async () => {
      const company = {
        id: 16385,
        allow_rc_feature_rcphone: false,
      };

      accountUserConfig.getCurrentCompanyId = jest.fn().mockReturnValue(16385);
      entitySourceController.get = jest.fn().mockReturnValue(company);
      const res = await companyController.isUserCompanyTelephonyOn();
      expect(res).toBeFalsy();
    });

    it('should return true when company allow to use phone', async () => {
      const company = {
        id: 16385,
        allow_rc_feature_rcphone: true,
      };

      accountUserConfig.getCurrentCompanyId = jest.fn().mockReturnValue(16385);
      entitySourceController.get = jest.fn().mockReturnValue(company);
      const res = await companyController.isUserCompanyTelephonyOn();
      expect(res).toBeTruthy();
    });

    it('should return false when company does not have allow to use phone key', async () => {
      const company = {
        id: 16385,
      };

      accountUserConfig.getCurrentCompanyId = jest.fn().mockReturnValue(16385);
      entitySourceController.get = jest.fn().mockReturnValue(company);
      const res = await companyController.isUserCompanyTelephonyOn();
      expect(res).toBeFalsy();
    });
  });

  describe('getUserAccountTypeFromSP430', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return undefined when can not find the company', async () => {
      accountUserConfig.getCurrentCompanyId = jest.fn().mockReturnValue(16385);
      entitySourceController.get = jest.fn().mockReturnValue(undefined);
      const res = await companyController.getUserAccountTypeFromSP430();
      expect(res).toBeUndefined();
    });

    it('should return undefined when can not fine the server parameter', async () => {
      const company = {
        id: 16385,
      };
      accountUserConfig.getCurrentCompanyId = jest.fn().mockReturnValue(16385);
      entitySourceController.get = jest.fn().mockReturnValue(company);
      const res = await companyController.getUserAccountTypeFromSP430();
      expect(res).toBeUndefined();
    });

    it('should return undefined when can not fine the server parameter 430', async () => {
      const company = {
        id: 16385,
        rc_service_parameters: [
          {
            accountId: '400130192008',
            id: 440,
            value: 'RCOffice',
          },
        ],
      };
      entitySourceController.get = jest.fn().mockReturnValue(company);
      const res = await companyController.getUserAccountTypeFromSP430();
      expect(res).toBeUndefined();
    });

    it('should return value in parameter server parameter 430', async () => {
      const company = {
        id: 16385,
        rc_service_parameters: [
          {
            accountId: '400130192008',
            id: 430,
            value: 'RCOffice',
          },
        ],
      };
      entitySourceController.get = jest.fn().mockReturnValue(company);
      const res = await companyController.getUserAccountTypeFromSP430();
      expect(res).toBe('RCOffice');
    });

    it('should return value in parameter server parameter 430', async () => {
      const company = {
        id: 16385,
        rc_service_parameters: [
          {
            accountId: '400130192008',
            id: 431,
            value: 'RCOffice',
          },
          {
            accountId: '400130192008',
            id: 430,
            value: 'TestType',
          },
        ],
      };
      entitySourceController.get = jest.fn().mockReturnValue(company);
      const res = await companyController.getUserAccountTypeFromSP430();
      expect(res).toBe('TestType');
    });
  });

  describe('getBrandType', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return brand type of the company', async () => {
      const company = {
        id: 16385,
        rc_brand: 'RC',
      };
      entitySourceController.get = jest.fn().mockReturnValue(company);
      expect(await companyController.getBrandType()).toEqual(company.rc_brand);
    });

    it('should return undefined when company has no such data', async () => {
      const company = {
        id: 16385,
      };
      entitySourceController.get = jest.fn().mockReturnValue(company);
      expect(await companyController.getBrandType()).toEqual(undefined);
    });
  });
});
